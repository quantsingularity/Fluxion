// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../contracts/SyntheticAssetFactory.sol";
import "../contracts/SyntheticLiquidationEngine.sol";
import "./mocks/MockERC20.sol";
import "./mocks/MockAggregatorV3.sol";

contract SyntheticLiquidationEngineTest is Test {
    address constant LINK_TOKEN_POINTER =
        0xC89bD4E1632D3A43CB03AAAd5262cbe4038Bc571;

    SyntheticAssetFactory factory;
    SyntheticLiquidationEngine engine;
    MockERC20 collateral;
    MockERC20 insuranceFund;
    MockAggregatorV3 oracle;

    address user1 = address(0x1);
    address liquidator = address(0x2);
    address keeper = address(0x3);

    bytes32 constant ASSET_ID = bytes32("fxAAPL");

    function setUp() public {
        vm.mockCall(
            LINK_TOKEN_POINTER,
            abi.encodeWithSignature("getAddress()"),
            abi.encode(address(0x1111111111111111111111111111111111111111))
        );

        factory = new SyntheticAssetFactory();
        collateral = new MockERC20("Mock USD", "mUSD");
        insuranceFund = new MockERC20("Mock Insurance", "mINS");
        oracle = new MockAggregatorV3(8, 1_000e8); // $1000

        factory.createSynthetic(
            ASSET_ID,
            address(collateral),
            address(oracle),
            address(0x0C1E),
            bytes32("job"),
            0
        );

        engine = new SyntheticLiquidationEngine(
            address(factory),
            address(insuranceFund)
        );

        // Grant the engine KEEPER_ROLE-independent access: SyntheticAssetFactory's
        // liquidate() is permissionless, so no extra role wiring is needed on
        // the vault side for the engine to call it.

        collateral.mint(user1, 1_000_000 ether);
        collateral.mint(liquidator, 1_000_000 ether);

        vm.prank(user1);
        collateral.approve(address(factory), type(uint256).max);
        vm.prank(liquidator);
        collateral.approve(address(factory), type(uint256).max);
    }

    /// @dev Liquidator must approve the engine to pull the synthetic tokens
    /// it needs to repay debt with, since the engine forwards them into the
    /// vault's burn call on the liquidator's behalf.
    function _approveEngineForSynthetic(address who) internal {
        address syntheticToken = factory.syntheticOf(ASSET_ID);
        vm.prank(who);
        IERC20(syntheticToken).approve(address(engine), type(uint256).max);
    }

    function _openUnderwaterPosition() internal {
        // user1: ~166.7% CR at $1000/token, opened with 100 collateral /
        // 60,000 synthetic units.
        vm.prank(user1);
        factory.mintSynthetic(ASSET_ID, 100 ether, 60_000 ether);

        // liquidator opens a large healthy position purely to hold synthetic
        // tokens to repay user1's debt with.
        vm.startPrank(liquidator);
        factory.mintSynthetic(ASSET_ID, 1000 ether, 600_000 ether);
        vm.stopPrank();

        // Price drops 30%: user1's CR falls to ~116.7%, below the engine's
        // 120% SOFT liquidation threshold.
        oracle.setAnswer(700e8);
        factory.refreshPrice(ASSET_ID);
    }

    function testLiquidateForwardsCollateralToCaller() public {
        _openUnderwaterPosition();
        _approveEngineForSynthetic(liquidator);

        uint256 liquidatorBalanceBefore = collateral.balanceOf(liquidator);

        vm.prank(liquidator);
        engine.liquidate(ASSET_ID, user1, 30_000 ether);

        // The core bug being tested: seized collateral must actually reach
        // the liquidator, not get stranded in the engine contract.
        assertGt(collateral.balanceOf(liquidator), liquidatorBalanceBefore);
        assertEq(collateral.balanceOf(address(engine)), 0);

        SyntheticLiquidationEngine.LiquidatorStats memory stats = engine
            .getLiquidatorStats(liquidator);
        assertEq(stats.totalLiquidations, 1);
        assertEq(stats.totalDebtRepaid, 30_000 ether);
        assertGt(stats.totalBonusEarned, 0);
    }

    function testLiquidateRejectsHealthyPosition() public {
        vm.prank(user1);
        factory.mintSynthetic(ASSET_ID, 100 ether, 60_000 ether); // ~166.7% CR, healthy

        vm.prank(liquidator);
        vm.expectRevert("Position is healthy");
        engine.liquidate(ASSET_ID, user1, 1 ether);
    }

    function testLiquidateRejectsOverCap() public {
        _openUnderwaterPosition();

        // Debt is 60,000; cap is 50% => 30,000 max per call.
        vm.prank(liquidator);
        vm.expectRevert("Exceeds 50 % cap per call");
        engine.liquidate(ASSET_ID, user1, 30_001 ether);
    }

    function testLiquidationsPausedBlocksLiquidate() public {
        _openUnderwaterPosition();

        engine.pauseLiquidations();
        assertTrue(engine.liquidationsPaused());

        vm.prank(liquidator);
        vm.expectRevert("Liquidations paused");
        engine.liquidate(ASSET_ID, user1, 1000 ether);

        engine.resumeLiquidations();
        assertFalse(engine.liquidationsPaused());

        _approveEngineForSynthetic(liquidator);
        vm.prank(liquidator);
        engine.liquidate(ASSET_ID, user1, 1000 ether); // now succeeds
    }

    function testOnlyEmergencyRoleCanPause() public {
        vm.prank(user1);
        vm.expectRevert();
        engine.pauseLiquidations();
    }

    function testBatchLiquidateCreditsOriginalKeeperNotEngine() public {
        _openUnderwaterPosition();

        engine.grantRole(engine.KEEPER_ROLE(), keeper);

        // The keeper needs synthetic tokens on hand to repay debt with, same
        // as any liquidator; give them a healthy position of their own.
        // Note: at this point the price has already been crashed to $700 by
        // _openUnderwaterPosition, so use enough collateral to stay above
        // the 150% minimum CR even at the lower price.
        collateral.mint(keeper, 3_000_000 ether);
        vm.startPrank(keeper);
        collateral.approve(address(factory), type(uint256).max);
        factory.mintSynthetic(ASSET_ID, 2000 ether, 600_000 ether);
        vm.stopPrank();
        _approveEngineForSynthetic(keeper);

        bytes32[] memory assetIds = new bytes32[](1);
        address[] memory users = new address[](1);
        uint256[] memory amounts = new uint256[](1);
        assetIds[0] = ASSET_ID;
        users[0] = user1;
        amounts[0] = 30_000 ether;

        uint256 keeperBalanceBefore = collateral.balanceOf(keeper);

        vm.prank(keeper);
        engine.batchLiquidate(assetIds, users, amounts);

        // The bug being tested: batch-triggered liquidations must credit the
        // keeper that called batchLiquidate, not the engine contract itself,
        // and must not strand collateral inside the engine.
        assertGt(collateral.balanceOf(keeper), keeperBalanceBefore);
        assertEq(collateral.balanceOf(address(engine)), 0);

        SyntheticLiquidationEngine.LiquidatorStats memory keeperStats = engine
            .getLiquidatorStats(keeper);
        SyntheticLiquidationEngine.LiquidatorStats memory engineStats = engine
            .getLiquidatorStats(address(engine));
        assertEq(keeperStats.totalLiquidations, 1);
        assertEq(engineStats.totalLiquidations, 0);
    }

    function testBatchLiquidateSingleRejectsExternalCaller() public {
        _openUnderwaterPosition();

        // Nobody but the engine itself may call this, otherwise anyone could
        // spoof an arbitrary `_liquidator` and redirect seized funds.
        vm.prank(liquidator);
        vm.expectRevert("Internal only");
        engine.batchLiquidateSingle(ASSET_ID, user1, 30_000 ether, liquidator);
    }

    function testOnlyKeeperRoleCanBatchLiquidate() public {
        bytes32[] memory assetIds = new bytes32[](0);
        address[] memory users = new address[](0);
        uint256[] memory amounts = new uint256[](0);

        vm.prank(user1);
        vm.expectRevert();
        engine.batchLiquidate(assetIds, users, amounts);
    }

    function testBadDebtCoveredByInsuranceFundGoesToLiquidator() public {
        _openUnderwaterPosition();
        _approveEngineForSynthetic(liquidator);

        // Crash the price far enough that the bonus-inflated seize exceeds
        // the position's actual remaining collateral, forcing an insurance
        // fund top-up.
        oracle.setAnswer(200e8);
        factory.refreshPrice(ASSET_ID);

        insuranceFund.mint(address(engine), 1_000_000 ether);

        uint256 liquidatorInsuranceBefore = insuranceFund.balanceOf(liquidator);

        vm.prank(liquidator);
        engine.liquidate(ASSET_ID, user1, 30_000 ether);

        assertGt(totalBadDebtOf(engine), 0);
        assertGt(
            insuranceFund.balanceOf(liquidator),
            liquidatorInsuranceBefore
        );
    }

    function totalBadDebtOf(
        SyntheticLiquidationEngine _engine
    ) internal view returns (uint256) {
        return _engine.totalBadDebt();
    }
}
