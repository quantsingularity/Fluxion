// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "../contracts/FluxionGovernanceToken.sol";

contract FluxionGovernanceTokenTest is Test {
    FluxionGovernanceToken token;

    address owner = address(this);
    address treasury = address(0x7B0A5);
    address user1 = address(0x1);
    address user2 = address(0x2);
    address compliance = address(0xC0);

    bytes32 MINTER_ROLE;
    bytes32 BURNER_ROLE;
    bytes32 PAUSER_ROLE;
    bytes32 TREASURY_ROLE;
    bytes32 COMPLIANCE_ROLE;

    function setUp() public {
        token = new FluxionGovernanceToken(
            "Fluxion Governance Token",
            "FGT",
            treasury
        );

        MINTER_ROLE = token.MINTER_ROLE();
        BURNER_ROLE = token.BURNER_ROLE();
        PAUSER_ROLE = token.PAUSER_ROLE();
        TREASURY_ROLE = token.TREASURY_ROLE();
        COMPLIANCE_ROLE = token.COMPLIANCE_ROLE();

        token.grantRole(COMPLIANCE_ROLE, compliance);
        token.grantRole(TREASURY_ROLE, treasury);

        // Most tests below exercise staking/vesting/compliance/governance
        // and aren't concerned with the transfer fee; disable it here so a
        // plain `transfer` moves exactly the amount requested. The
        // fee-specific test re-enables it explicitly.
        token.updateTreasuryFeeRate(0);
    }

    // ───────────────────────────── Deployment ─────────────────────────────

    function testDeploymentInitialState() public view {
        assertEq(token.name(), "Fluxion Governance Token");
        assertEq(token.symbol(), "FGT");
        assertEq(token.treasury(), treasury);
        assertEq(token.totalSupply(), 100_000_000 ether);
        assertEq(token.balanceOf(owner), 100_000_000 ether);
    }

    function testDeploymentRoleAssignments() public view {
        assertTrue(token.hasRole(token.DEFAULT_ADMIN_ROLE(), owner));
        assertTrue(token.hasRole(COMPLIANCE_ROLE, compliance));
    }

    function testDeploymentGovernanceDefaults() public {
        // Deploy a fresh instance here since the shared fixture's setUp()
        // zeroes the fee rate afterward for test isolation; this checks the
        // constructor's actual default before any post-deploy mutation.
        FluxionGovernanceToken freshToken = new FluxionGovernanceToken(
            "Fluxion Governance Token",
            "FGT",
            treasury
        );

        assertEq(freshToken.rewardRate(), 1000);
        assertEq(freshToken.treasuryFeeRate(), 500);
        assertEq(freshToken.proposalThreshold(), 1_000_000 ether);
        assertEq(freshToken.votingDelay(), 1 days);
        assertEq(freshToken.votingPeriod(), 7 days);
        assertEq(freshToken.quorumPercentage(), 4);
    }

    // ───────────────────────────── Staking ─────────────────────────────

    function testStakeTokens() public {
        uint256 stakeAmount = 1000 ether;
        uint256 lockPeriod = 30 days;

        token.transfer(user1, stakeAmount);

        vm.prank(user1);
        token.stake(stakeAmount, lockPeriod);

        (
            uint256 stakedAmount,
            ,
            ,
            uint256 storedLockPeriod,
            bool isLocked
        ) = token.stakingInfo(user1);

        assertEq(stakedAmount, stakeAmount);
        assertEq(storedLockPeriod, lockPeriod);
        assertTrue(isLocked);
        assertEq(token.totalStaked(), stakeAmount);
        assertEq(token.balanceOf(address(token)), stakeAmount);
    }

    function testCannotUnstakeDuringLock() public {
        uint256 stakeAmount = 1000 ether;
        uint256 lockPeriod = 30 days;

        token.transfer(user1, stakeAmount);
        vm.startPrank(user1);
        token.stake(stakeAmount, lockPeriod);

        vm.expectRevert("Tokens are still locked");
        token.unstake(stakeAmount);
        vm.stopPrank();
    }

    function testUnstakeAfterLockPeriod() public {
        uint256 stakeAmount = 1000 ether;
        uint256 lockPeriod = 1 days;

        token.transfer(user1, stakeAmount);
        vm.startPrank(user1);
        token.stake(stakeAmount, lockPeriod);

        vm.warp(block.timestamp + lockPeriod + 1);
        token.unstake(stakeAmount);
        vm.stopPrank();

        (uint256 stakedAmount, , , , ) = token.stakingInfo(user1);
        assertEq(stakedAmount, 0);
        assertEq(token.totalStaked(), 0);
    }

    function testStakingRewardsAccrueOverOneYear() public {
        uint256 stakeAmount = 1000 ether;

        token.transfer(user1, stakeAmount);
        vm.startPrank(user1);
        token.stake(stakeAmount, 0);

        vm.warp(block.timestamp + 365 days);

        uint256 initialBalance = token.balanceOf(user1);
        token.claimRewards();
        uint256 finalBalance = token.balanceOf(user1);
        vm.stopPrank();

        uint256 rewards = finalBalance - initialBalance;
        uint256 expectedRewards = (stakeAmount * 1000) / 10000; // 10% APY
        assertApproxEqAbs(rewards, expectedRewards, 10 ether);
    }

    function testMultipleStakersTrackedIndependently() public {
        uint256 stakeAmount1 = 1000 ether;
        uint256 stakeAmount2 = 2000 ether;

        token.transfer(user1, stakeAmount1);
        token.transfer(user2, stakeAmount2);

        vm.prank(user1);
        token.stake(stakeAmount1, 0);
        vm.prank(user2);
        token.stake(stakeAmount2, 0);

        assertEq(token.totalStaked(), stakeAmount1 + stakeAmount2);

        (uint256 staked1, , , , ) = token.stakingInfo(user1);
        (uint256 staked2, , , , ) = token.stakingInfo(user2);
        assertEq(staked1, stakeAmount1);
        assertEq(staked2, stakeAmount2);
    }

    // ───────────────────────────── Vesting ─────────────────────────────

    function testCreateVestingSchedule() public {
        uint256 vestingAmount = 10_000 ether;
        uint256 startTime = block.timestamp + 1 days;
        uint256 duration = 365 days;
        uint256 cliffDuration = 90 days;

        token.createVestingSchedule(
            user1,
            vestingAmount,
            startTime,
            duration,
            cliffDuration,
            false
        );

        assertEq(token.getVestingScheduleCount(user1), 1);
        assertEq(token.totalVestingAmount(), vestingAmount);
        assertEq(token.balanceOf(address(token)), vestingAmount);
    }

    function testNoReleaseBeforeCliff() public {
        uint256 vestingAmount = 10_000 ether;
        uint256 startTime = block.timestamp;
        uint256 duration = 365 days;
        uint256 cliffDuration = 90 days;

        token.createVestingSchedule(
            user1,
            vestingAmount,
            startTime,
            duration,
            cliffDuration,
            false
        );

        vm.warp(block.timestamp + 30 days);
        assertEq(token.calculateReleasableAmount(user1, 0), 0);
    }

    function testProportionalReleaseAfterCliff() public {
        uint256 vestingAmount = 12_000 ether;
        uint256 startTime = block.timestamp;
        uint256 duration = 12 * 30 days;
        uint256 cliffDuration = 3 * 30 days;

        token.createVestingSchedule(
            user1,
            vestingAmount,
            startTime,
            duration,
            cliffDuration,
            false
        );

        vm.warp(block.timestamp + 6 * 30 days);

        uint256 releasable = token.calculateReleasableAmount(user1, 0);
        assertApproxEqAbs(releasable, vestingAmount / 2, 100 ether);
    }

    function testReleaseVestedTokensToBeneficiary() public {
        uint256 vestingAmount = 10_000 ether;
        token.createVestingSchedule(
            user1,
            vestingAmount,
            block.timestamp,
            365 days,
            90 days,
            false
        );

        vm.warp(block.timestamp + 180 days);

        uint256 initialBalance = token.balanceOf(user1);
        token.releaseVestedTokens(user1, 0);
        assertGt(token.balanceOf(user1), initialBalance);
    }

    function testRevokeRevocableVestingReturnsRemainderToTreasury() public {
        uint256 vestingAmount = 10_000 ether;
        token.createVestingSchedule(
            user1,
            vestingAmount,
            block.timestamp,
            365 days,
            90 days,
            true
        );

        vm.warp(block.timestamp + 180 days);

        uint256 treasuryBefore = token.balanceOf(treasury);
        token.revokeVesting(user1, 0);
        assertGt(token.balanceOf(treasury), treasuryBefore);
    }

    // ───────────────────────────── Compliance ─────────────────────────────

    function testComplianceCanBlacklist() public {
        vm.prank(compliance);
        token.updateBlacklist(user1, true);
        assertTrue(token.blacklisted(user1));
    }

    function testBlacklistedAddressCannotTransfer() public {
        uint256 amount = 1000 ether;
        token.transfer(user1, amount);

        vm.prank(compliance);
        token.updateBlacklist(user1, true);

        vm.prank(user1);
        vm.expectRevert("Address is blacklisted");
        token.transfer(user2, amount);
    }

    function testWhitelistEnforcedWhenEnabled() public {
        uint256 amount = 1000 ether;
        token.transfer(user1, amount);

        vm.prank(compliance);
        token.setWhitelistEnabled(true);

        vm.prank(user1);
        vm.expectRevert("Address not whitelisted");
        token.transfer(user2, amount);

        vm.startPrank(compliance);
        token.updateWhitelist(user1, true);
        token.updateWhitelist(user2, true);
        vm.stopPrank();

        vm.prank(user1);
        token.transfer(user2, amount);
    }

    function testTransferAmountLimitEnforced() public {
        uint256 maxTransfer = 5000 ether;
        uint256 transferAmount = 10_000 ether;

        // Fund user1 before the limit is imposed, so the funding transfer
        // itself (well above maxTransfer) is not what reverts.
        token.transfer(user1, transferAmount);

        vm.prank(compliance);
        token.updateComplianceLimits(maxTransfer, 0);

        vm.prank(user1);
        vm.expectRevert("Transfer amount exceeds limit");
        token.transfer(user2, transferAmount);

        vm.prank(user1);
        token.transfer(user2, maxTransfer);
    }

    function testDailyTransferLimitEnforced() public {
        uint256 dailyLimit = 2000 ether;
        uint256 transferAmount = 1500 ether;

        // Fund user1 before the daily limit is imposed.
        token.transfer(user1, 5000 ether);

        vm.prank(compliance);
        token.updateComplianceLimits(0, dailyLimit);

        vm.prank(user1);
        token.transfer(user2, transferAmount);

        vm.prank(user1);
        vm.expectRevert("Daily transfer limit exceeded");
        token.transfer(user2, transferAmount);
    }

    function testTreasuryFeeAccruesInContractThenSweepsToTreasury() public {
        uint256 transferAmount = 1000 ether;
        uint256 expectedFee = (transferAmount * 500) / 10000; // 5%

        token.transfer(user1, transferAmount);
        token.updateTreasuryFeeRate(500); // re-enable for this test

        uint256 contractBalanceBefore = token.balanceOf(address(token));
        vm.prank(user1);
        token.transfer(user2, transferAmount);

        // Fee accrues on this contract's own balance, tracked by
        // totalFeesCollected, until the treasury sweeps it out.
        assertEq(
            token.balanceOf(address(token)) - contractBalanceBefore,
            expectedFee
        );
        assertEq(token.totalFeesCollected(), expectedFee);
        assertEq(token.balanceOf(user2), transferAmount - expectedFee);

        uint256 treasuryBefore = token.balanceOf(treasury);
        vm.prank(treasury);
        token.withdrawFeesToTreasury();

        assertEq(token.balanceOf(treasury) - treasuryBefore, expectedFee);
        assertEq(token.totalFeesCollected(), 0);
    }

    // ───────────────────────────── Governance ─────────────────────────────

    function testUpdateGovernanceParameters() public {
        token.updateGovernanceParameters(2_000_000 ether, 2 days, 14 days, 5);

        assertEq(token.proposalThreshold(), 2_000_000 ether);
        assertEq(token.votingDelay(), 2 days);
        assertEq(token.votingPeriod(), 14 days);
        assertEq(token.quorumPercentage(), 5);
    }

    function testGovernanceParametersRejectHighQuorum() public {
        vm.expectRevert("Quorum cannot exceed 20%");
        token.updateGovernanceParameters(1_000_000 ether, 1 days, 7 days, 25);
    }

    function testGovernanceParametersRejectShortVotingPeriod() public {
        vm.expectRevert("Voting period too short");
        token.updateGovernanceParameters(1_000_000 ether, 1 days, 1 hours, 4);
    }

    // ───────────────────────────── Admin ─────────────────────────────

    function testMintByMinterRole() public {
        uint256 mintAmount = 1_000_000 ether;
        token.mint(user1, mintAmount);
        assertEq(token.balanceOf(user1), mintAmount);
    }

    function testMintCannotExceedMaxSupply() public {
        uint256 excess = token.MAX_SUPPLY() - token.totalSupply() + 1;
        vm.expectRevert("Would exceed maximum supply");
        token.mint(user1, excess);
    }

    function testBurnByBurnerRole() public {
        uint256 burnAmount = 1_000_000 ether;
        uint256 initialSupply = token.totalSupply();
        token.burn(burnAmount);
        assertEq(token.totalSupply(), initialSupply - burnAmount);
    }

    function testPauseBlocksTransfersThenUnpause() public {
        token.pause();
        assertTrue(token.paused());

        vm.expectRevert("Pausable: paused");
        token.transfer(user1, 1000 ether);

        token.unpause();
        assertFalse(token.paused());
    }

    function testUpdateRewardRateWithinLimits() public {
        token.updateRewardRate(2000);
        assertEq(token.rewardRate(), 2000);

        vm.expectRevert("Reward rate cannot exceed 50%");
        token.updateRewardRate(6000);
    }

    // ───────────────────────────── Treasury ─────────────────────────────

    function testUpdateTreasuryAddress() public {
        vm.prank(treasury);
        token.updateTreasury(user1);
        assertEq(token.treasury(), user1);
    }

    function testUpdateTreasuryFeeRateWithinLimits() public {
        vm.startPrank(treasury);
        token.updateTreasuryFeeRate(750);
        assertEq(token.treasuryFeeRate(), 750);

        vm.expectRevert("Fee rate cannot exceed 10%");
        token.updateTreasuryFeeRate(1500);
        vm.stopPrank();
    }

    function testWithdrawFeesToTreasuryRevertsWithNoFees() public {
        vm.prank(treasury);
        vm.expectRevert("No fees to distribute");
        token.withdrawFeesToTreasury();
    }

    // ───────────────────────────── View functions ─────────────────────────────

    function testCurrentDayMatchesTimestamp() public view {
        assertEq(token.getCurrentDay(), block.timestamp / 1 days);
    }

    function testCanTransferReflectsBlacklist() public {
        uint256 amount = 1000 ether;
        assertTrue(token.canTransfer(user1, user2, amount));

        vm.prank(compliance);
        token.updateBlacklist(user1, true);

        assertFalse(token.canTransfer(user1, user2, amount));
    }

    // ───────────────────────────── Edge cases ─────────────────────────────

    function testZeroAmountStakeReverts() public {
        vm.prank(user1);
        vm.expectRevert("Amount must be greater than 0");
        token.stake(0, 0);
    }

    function testInsufficientBalanceStakeReverts() public {
        vm.prank(user1);
        vm.expectRevert("Insufficient balance");
        token.stake(1000 ether, 0);
    }

    function testOverUnstakeReverts() public {
        uint256 stakeAmount = 1000 ether;
        token.transfer(user1, stakeAmount);

        vm.startPrank(user1);
        token.stake(stakeAmount, 0);
        vm.expectRevert("Insufficient staked amount");
        token.unstake(2000 ether);
        vm.stopPrank();
    }

    function testNonMinterCannotMint() public {
        vm.prank(user1);
        vm.expectRevert();
        token.mint(user1, 1000 ether);
    }

    // ───────────────────────────── Integration ─────────────────────────────

    function testStakingAndVestingIntegration() public {
        uint256 vestingAmount = 10_000 ether;
        uint256 stakeAmount = 5000 ether;

        token.createVestingSchedule(
            user1,
            vestingAmount,
            block.timestamp,
            365 days,
            90 days,
            false
        );

        token.transfer(user2, stakeAmount);
        vm.prank(user2);
        token.stake(stakeAmount, 0);

        vm.warp(block.timestamp + 180 days);
        token.releaseVestedTokens(user1, 0);

        uint256 user1Balance = token.balanceOf(user1);
        assertGt(user1Balance, 0);

        vm.prank(user1);
        token.stake(user1Balance, 0);

        vm.warp(block.timestamp + 30 days);

        assertGt(token.pendingRewards(user1), 0);
        assertGt(token.pendingRewards(user2), 0);
    }

    function testGovernanceTokenLifecycle() public {
        token.updateTreasuryFeeRate(500); // exercise the fee leg of the lifecycle
        uint256 distributionAmount = 10_000 ether;
        token.transfer(user1, distributionAmount);
        token.transfer(user2, distributionAmount);

        vm.prank(user1);
        token.stake(distributionAmount / 2, 0);
        vm.prank(user2);
        token.stake(distributionAmount / 2, 0);

        token.updateGovernanceParameters(500_000 ether, 12 hours, 5 days, 3);

        vm.prank(user1);
        token.transfer(user2, 1000 ether);

        assertGt(token.totalFeesCollected(), 0);

        vm.warp(block.timestamp + 30 days);

        uint256 initialUser1Balance = token.balanceOf(user1);
        vm.prank(user1);
        token.claimRewards();
        assertGt(token.balanceOf(user1), initialUser1Balance);
    }
}
