import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiArrowLeft, FiCheckCircle, FiMail } from "react-icons/fi";
import { Link as RouterLink } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { authAPI } from "../../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      await authAPI.requestPasswordReset(email);
    } catch {
      // Intentionally ignore: we always show the same confirmation so we never
      // reveal whether an email is registered.
    } finally {
      setIsLoading(false);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="Check your inbox">
        <VStack spacing={6} align="stretch">
          <Flex
            w="60px"
            h="60px"
            borderRadius="full"
            bg="green.900"
            align="center"
            justify="center"
          >
            <Icon as={FiCheckCircle} boxSize={7} color="green.400" />
          </Flex>
          <Text color="gray.400">
            If an account exists for{" "}
            <Text as="span" color="white" fontWeight="semibold">
              {email}
            </Text>
            , you will receive a password reset link shortly. Be sure to check
            your spam folder.
          </Text>
          <Button
            as={RouterLink}
            to="/signin"
            leftIcon={<FiArrowLeft />}
            variant="outline"
            color="white"
            borderColor="whiteAlpha.400"
            bg="whiteAlpha.50"
            _hover={{
              bg: "whiteAlpha.200",
              borderColor: "brand.400",
              color: "brand.200",
            }}
          >
            Back to sign in
          </Button>
        </VStack>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email tied to your account and we'll send you a reset link."
    >
      <Box as="form" onSubmit={handleSubmit}>
        {error && (
          <Alert status="error" borderRadius="md" mb={5} bg="red.900">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}

        <FormControl mb={6} isRequired>
          <FormLabel fontSize="sm" color="gray.300">
            Email address
          </FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiMail} color="gray.500" />
            </InputLeftElement>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              bg="gray.900"
              borderColor="gray.700"
              _hover={{ borderColor: "gray.600" }}
              _focus={{
                borderColor: "brand.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
              }}
              autoComplete="email"
            />
          </InputGroup>
        </FormControl>

        <Button
          type="submit"
          w="full"
          size="lg"
          colorScheme="brand"
          bgGradient="linear(to-r, brand.500, accent.500)"
          _hover={{ bgGradient: "linear(to-r, brand.600, accent.600)" }}
          isLoading={isLoading}
          loadingText="Sending link"
        >
          Send reset link
        </Button>

        <Flex justify="center" mt={6}>
          <Text
            as={RouterLink}
            to="/signin"
            fontSize="sm"
            color="brand.300"
            _hover={{ color: "brand.200" }}
            display="inline-flex"
            alignItems="center"
            gap={1}
          >
            <Icon as={FiArrowLeft} boxSize={3} /> Back to sign in
          </Text>
        </Flex>
      </Box>
    </AuthLayout>
  );
};

export default ForgotPassword;
