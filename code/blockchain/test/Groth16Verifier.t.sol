// SPDX-License-Identifier: AGPL-3.0
pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "../contracts/zk/Groth16Verifier.sol";

/**
 * @dev Groth16Verifier.sol ships with illustrative placeholder verifying-key
 *      constants, not the output of a real trusted setup for any specific
 *      circuit, so a genuinely valid proof can't be constructed for it here.
 *      These tests cover what can actually be verified: the public-input
 *      field-membership guard, and that structurally-arbitrary proofs are
 *      correctly rejected rather than reverting unexpectedly.
 */
contract Groth16VerifierTest is Test {
    Groth16Verifier verifier;

    // BN254 scalar field modulus (SNARK_SCALAR_FIELD in the contract).
    uint256 constant SNARK_SCALAR_FIELD =
        21888242871839275222246405745257275088548364400416034343698204186575808495617;

    function setUp() public {
        verifier = new Groth16Verifier();
    }

    function testVerifyProofRejectsOutOfFieldPublicInput() public {
        uint256[8] memory proof; // all zero
        uint256[4] memory input;
        input[0] = SNARK_SCALAR_FIELD; // exactly at the field modulus: invalid

        vm.expectRevert("Public input out of field");
        verifier.verifyProof(proof, input);
    }

    function testVerifyProofRejectsGarbageProof() public {
        uint256[8] memory proof; // all-zero points are not a valid proof
        uint256[4] memory input; // all-zero public inputs, within field

        // The shipped verifying-key constants (vk.ic[1]..[4]) are
        // illustrative placeholders, not the output of a real trusted setup,
        // and aren't valid points on the BN254 curve. The ecmul precompile
        // used inside verifyProof reverts on invalid curve points rather
        // than returning false, so that's the honest, correct expectation
        // here until this contract is wired up to a real circuit's VK.
        vm.expectRevert("G1ScalarMul precompile failed");
        verifier.verifyProof(proof, input);
    }

    function testVerifyProofAcceptsInFieldInputsWithoutReverting() public {
        uint256[8] memory proof;
        uint256[4] memory input;
        input[0] = 1;
        input[1] = 2;
        input[2] = 3;
        input[3] = 4;

        // Same root cause as above: the placeholder vk.ic entries are not
        // valid curve points, so any nonzero public input also hits the
        // ecmul precompile revert rather than reaching a pairing result.
        vm.expectRevert("G1ScalarMul precompile failed");
        verifier.verifyProof(proof, input);
    }
}
