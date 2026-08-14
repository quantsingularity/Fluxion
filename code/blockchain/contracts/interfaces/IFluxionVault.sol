// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.19;

/**
 * @title IFluxionVault
 * @notice Common interface implemented by any vault that
 *         SyntheticLiquidationEngine can drive liquidations against.
 *         Kept in its own file so both the vault implementation
 *         (SyntheticAssetFactory) and its consumer (SyntheticLiquidationEngine)
 *         compile against a single shared definition instead of two
 *         independently maintained copies.
 */
interface IFluxionVault {
    function getPosition(
        bytes32 assetId,
        address user
    )
        external
        view
        returns (
            uint256 collateral,
            uint256 debt,
            uint256 ratioBPS,
            bool isLiquidatable
        );

    function liquidate(
        bytes32 assetId,
        address user,
        uint256 debtRepaid
    ) external;

    function getOraclePrice(
        bytes32 assetId
    ) external view returns (uint256 price18, uint256 updatedAt);

    /// @notice Returns the collateral token backing a given synthetic asset.
    /// @dev Required so the liquidation engine can forward seized collateral
    ///      (received when it calls `liquidate`) on to the liquidator that
    ///      triggered the call.
    function collateralOf(bytes32 assetId) external view returns (address);

    /// @notice Returns the synthetic token for a given asset id.
    /// @dev Required because vault implementations burn the repaid debt from
    ///      their *caller's* own balance (see SyntheticAssetFactory.liquidate,
    ///      which calls `forceBurn(msg.sender, ...)`). Since the engine is
    ///      the one calling `liquidate` on the vault, it must first pull the
    ///      repaid amount of synthetic tokens from the actual liquidator into
    ///      its own balance so that burn succeeds.
    function syntheticOf(bytes32 assetId) external view returns (address);
}
