import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../lib/auth-context.jsx";

const SignIn = () => {
  const { signIn, isSubmitting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    const result = await signIn({ email, password });
    if (result.ok) {
      navigate(redirectTo, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to access your dashboard, pools and positions."
    >
      <Box as="form" onSubmit={handleSubmit}>
        {error && (
          <Alert status="error" borderRadius="md" mb={5} bg="red.900">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}

        <FormControl mb={4} isRequired>
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

        <FormControl mb={4} isRequired>
          <FormLabel fontSize="sm" color="gray.300">
            Password
          </FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiLock} color="gray.500" />
            </InputLeftElement>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              bg="gray.900"
              borderColor="gray.700"
              _hover={{ borderColor: "gray.600" }}
              _focus={{
                borderColor: "brand.500",
                boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
              }}
              autoComplete="current-password"
            />
            <InputRightElement>
              <Icon
                as={showPassword ? FiEyeOff : FiEye}
                color="gray.500"
                cursor="pointer"
                onClick={() => setShowPassword((v) => !v)}
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <Flex justify="space-between" align="center" mb={6}>
          <Checkbox
            colorScheme="brand"
            isChecked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            size="sm"
          >
            <Text fontSize="sm" color="gray.400">
              Remember me
            </Text>
          </Checkbox>
          <Text
            as={RouterLink}
            to="/forgot-password"
            fontSize="sm"
            color="brand.300"
            _hover={{ color: "brand.200" }}
          >
            Forgot password?
          </Text>
        </Flex>

        <Button
          type="submit"
          w="full"
          size="lg"
          colorScheme="brand"
          bgGradient="linear(to-r, brand.500, accent.500)"
          _hover={{ bgGradient: "linear(to-r, brand.600, accent.600)" }}
          isLoading={isSubmitting}
          loadingText="Signing in"
        >
          Sign in
        </Button>

        <HStack my={6}>
          <Divider borderColor="gray.700" />
          <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
            NEW TO FLUXION
          </Text>
          <Divider borderColor="gray.700" />
        </HStack>

        <Button
          as={RouterLink}
          to="/signup"
          w="full"
          size="lg"
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
          Create an account
        </Button>
      </Box>
    </AuthLayout>
  );
};

export default SignIn;
