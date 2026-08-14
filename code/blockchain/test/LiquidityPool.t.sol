// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "../contracts/LiquidityPoolManager.sol";

contract LiquidityPoolTest is Test {
    FluxionLiquidityPoolManager pool;
    address[] assets;
    uint256[] weights;
    address[] oracles;
    uint256[] heartbeats;

    function setUp() public {
        pool = new FluxionLiquidityPoolManager();
        assets = [address(1), address(2)];
        weights = [5e17, 5e17];
        oracles = [address(10), address(11)];
        heartbeats = [1 hours, 1 hours];
    }

    function testPoolCreation() public {
        uint256 createdAt = block.timestamp;
        pool.createPool(assets, weights, 0.003e18, 100, oracles, heartbeats);

        bytes32 poolId = keccak256(
            abi.encodePacked(assets, address(this), createdAt)
        );

        (
            address[] memory poolAssets,
            uint256[] memory poolWeights,
            uint256 fee,
            uint256 amplification,
            bool active,
            uint256 totalLiquidity
        ) = pool.getPool(poolId);

        assertEq(fee, 0.003e18);
        assertEq(amplification, 100);
        assertTrue(active);
        assertEq(totalLiquidity, 0);
        assertEq(poolAssets.length, 2);
        assertEq(poolAssets[0], assets[0]);
        assertEq(poolWeights[0], weights[0]);
    }

    function testCreatePoolRejectsFeeAboveMax() public {
        uint256 tooHighFee = pool.MAX_FEE() + 1;
        vm.expectRevert("Fee too high");
        pool.createPool(assets, weights, tooHighFee, 100, oracles, heartbeats);
    }

    function testCreatePoolRejectsMismatchedLengths() public {
        uint256[] memory badWeights = new uint256[](1);
        badWeights[0] = 1e18;
        vm.expectRevert("Assets and weights length mismatch");
        pool.createPool(assets, badWeights, 0.003e18, 100, oracles, heartbeats);
    }

    function testOnlyPoolAdminCanCreatePool() public {
        address stranger = address(0xBEEF);
        vm.prank(stranger);
        vm.expectRevert();
        pool.createPool(assets, weights, 0.003e18, 100, oracles, heartbeats);
    }

    function testDeactivateAndActivatePool() public {
        uint256 createdAt = block.timestamp;
        pool.createPool(assets, weights, 0.003e18, 100, oracles, heartbeats);
        bytes32 poolId = keccak256(
            abi.encodePacked(assets, address(this), createdAt)
        );

        pool.deactivatePool(poolId);
        (, , , , bool activeAfterDeactivate, ) = pool.getPool(poolId);
        assertFalse(activeAfterDeactivate);

        pool.activatePool(poolId);
        (, , , , bool activeAfterActivate, ) = pool.getPool(poolId);
        assertTrue(activeAfterActivate);
    }

    function testUpdatePoolFeeRespectsMax() public {
        uint256 createdAt = block.timestamp;
        pool.createPool(assets, weights, 0.003e18, 100, oracles, heartbeats);
        bytes32 poolId = keccak256(
            abi.encodePacked(assets, address(this), createdAt)
        );

        pool.updatePoolFee(poolId, 0.005e18);
        (, , uint256 fee, , , ) = pool.getPool(poolId);
        assertEq(fee, 0.005e18);

        uint256 tooHighFee = pool.MAX_FEE() + 1;
        vm.expectRevert("Fee too high");
        pool.updatePoolFee(poolId, tooHighFee);
    }
}
