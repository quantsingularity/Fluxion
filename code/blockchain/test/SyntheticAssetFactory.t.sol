// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "../contracts/SyntheticAssetFactory.sol";
import "./mocks/MockERC20.sol";
import "./mocks/MockAggregatorV3.sol";

contract SyntheticAssetFactoryTest is Test {
    // Hardcoded LINK token pointer address used by ChainlinkClient's
    // _setPublicChainlinkToken(); mocked below so the constructor (which
    // otherwise assumes a live mainnet-style deployment) works on the
    // bare Foundry test EVM.
    address constant LINK_TOKEN_POINTER =
        0xC89bD4E1632D3A43CB03AAAd5262cbe4038Bc571;

    SyntheticAssetFactory factory;
    MockERC20 collateral;
    MockAggregatorV3 oracle;

    address user1 = address(0x1);
    address user2 = address(0x2);
    address liquidator = address(0x3);

    bytes32 constant ASSET_ID = bytes32("fxAAPL");

    function setUp() public {
        vm.mockCall(
            LINK_TOKEN_POINTER,
            abi.encodeWithSignature("getAddress()"),
            abi.encode(address(0x1111111111111111111111111111111111111111))
        );

        factory = new SyntheticAssetFactory();
        collateral = new MockERC20("Mock USD", "mUSD");
        oracle = new MockAggregatorV3(8, 1_000e8); // $1000, 8 decimals

        collateral.mint(user1, 1_000_000 ether);
        collateral.mint(user2, 1_000_000 ether);

        vm.prank(user1);
        collateral.approve(address(factory), type(uint256).max);
        vm.prank(user2);
        collateral.approve(address(factory), type(uint256).max);

        factory.createSynthetic(
            ASSET_ID,
            address(collateral),
            address(oracle),
            address(0x0C1E), // placeholder CL oracle, unused by these tests
            bytes32("job"),
            0
        );
    }

    function testCreateSyntheticRegistersAssetAndPullsPrice() public view {
        assertEq(factory.getAssetCount(), 1);
        assertEq(factory.collateralOf(ASSET_ID), address(collateral));
        (uint256 price, ) = factory.getOraclePrice(ASSET_ID);
        assertEq(price, 1000 ether); // scaled from 8 to 18 decimals
    }

    function testCreateSyntheticRejectsDuplicateAssetId() public {
        vm.expectRevert("Asset already exists");
        factory.createSynthetic(
            ASSET_ID,
            address(collateral),
            address(oracle),
            address(0x0C1E),
            bytes32("job"),
            0
        );
    }

    function testMintSyntheticRespectsMinCollateralRatio() public {
        // $1000/token collateral price. 100 collateral tokens = $100,000
        // collateralUSD. This vault's CR math treats each synthetic unit as
        // $1 of debt, so minting 70,000 units implies ~142.8% CR, below the
        // 150% minimum.
        vm.startPrank(user1);
        vm.expectRevert("CR below 150% minimum");
        factory.mintSynthetic(ASSET_ID, 100 ether, 70_000 ether);
        vm.stopPrank();
    }

    function testMintAndBurnSynthetic() public {
        vm.startPrank(user1);
        factory.mintSynthetic(ASSET_ID, 300 ether, 100 ether);

        (uint256 collateralDeposited, uint256 debt, , ) = factory.getPosition(
            ASSET_ID,
            user1
        );
        assertEq(collateralDeposited, 300 ether);
        assertEq(debt, 100 ether);

        factory.burnSynthetic(ASSET_ID, 100 ether);
        (, uint256 debtAfter, , ) = factory.getPosition(ASSET_ID, user1);
        assertEq(debtAfter, 0);
        vm.stopPrank();
    }

    function testLiquidateUndercollateralizedPosition() public {
        // user1 opens a healthy (~166.7% CR) position that a price crash
        // will push underwater.
        vm.prank(user1);
        factory.mintSynthetic(ASSET_ID, 100 ether, 60_000 ether);

        // liquidator opens their own well-collateralized position purely so
        // they hold synthetic tokens to repay user1's debt with (liquidate()
        // burns synthetic tokens from the caller's own balance).
        collateral.mint(liquidator, 1_000_000 ether);
        vm.startPrank(liquidator);
        collateral.approve(address(factory), type(uint256).max);
        factory.mintSynthetic(ASSET_ID, 1000 ether, 600_000 ether);
        vm.stopPrank();

        // Price drops 30%, from $1000 to $700; user1's CR falls from
        // ~166.7% to ~116.7%, below the 120% liquidation threshold.
        oracle.setAnswer(700e8);
        factory.refreshPrice(ASSET_ID);

        (, , , bool isLiquidatable) = factory.getPosition(ASSET_ID, user1);
        assertTrue(isLiquidatable);

        uint256 liquidatorCollateralBefore = collateral.balanceOf(liquidator);

        vm.prank(liquidator);
        factory.liquidate(ASSET_ID, user1, 30_000 ether); // repay half the debt (50% cap)

        assertGt(collateral.balanceOf(liquidator), liquidatorCollateralBefore);

        (, uint256 debtAfter, , ) = factory.getPosition(ASSET_ID, user1);
        assertEq(debtAfter, 30_000 ether);
    }

    function testGetPositionReportsLiquidatable() public {
        vm.prank(user1);
        factory.mintSynthetic(ASSET_ID, 100 ether, 60_000 ether);

        oracle.setAnswer(700e8);
        factory.refreshPrice(ASSET_ID);

        (, , , bool isLiquidatable) = factory.getPosition(ASSET_ID, user1);
        assertTrue(isLiquidatable);
    }

    function testRefreshPriceRejectsStaleOracle() public {
        oracle.setStale(block.timestamp);
        vm.warp(block.timestamp + 2 hours);

        vm.expectRevert("Aggregator price stale");
        factory.refreshPrice(ASSET_ID);
    }

    function testMintRejectsStalePrice() public {
        // Advance time so the price pulled at createSynthetic-time is stale
        // (ORACLE_STALENESS is 1 hour) without refreshing it.
        vm.warp(block.timestamp + 2 hours);

        vm.prank(user1);
        vm.expectRevert("Price stale");
        factory.mintSynthetic(ASSET_ID, 300 ether, 100 ether);
    }
}
