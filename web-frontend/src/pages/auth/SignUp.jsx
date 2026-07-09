import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Progress,
  Text,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from "react-icons/fi";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import { useAuth } from "../../lib/auth-context.jsx";

// Mirrors the backend UserRegister password policy so users get instant,
// accurate feedback before the request is ever sent.
const passwordRules = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /\d/.test(v) },
  {
    label: "One special character",
    test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v),
  },
];

const SignUp = () => {
  const { signUp, isSubmitting } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const passedRules = useMemo(
    () => passwordRules.filter((rule) => rule.test(form.password)).length,
    [form.password],
  );
  const strengthPct = (passedRules / passwordRules.length) * 100;
  const strengthColor =
    strengthPct >= 100 ? "green" : strengthPct >= 60 ? "yellow" : "red";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (passedRules < passwordRules.length) {
      setError(
        "Please choose a stronger password that meets all requirements.",
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!acceptTerms) {
      setError("You must accept the Terms of Service and Privacy Policy.");
      return;
    }

    const result = await signUp({
      email: form.email,
      password: form.password,
      confirm_password: form.confirmPassword,
      first_name: form.firstName || undefined,
      last_name: form.lastName || undefined,
      terms_accepted: true,
      privacy_accepted: true,
    });

    if (result.ok) {
      navigate("/dashboard", { replace: true });
    } else {
      setError(result.error);
    }
  };

  const inputStyles = {
    bg: "gray.900",
    borderColor: "gray.700",
    _hover: { borderColor: "gray.600" },
    _focus: {
      borderColor: "brand.500",
      boxShadow: "0 0 0 1px var(--chakra-colors-brand-500)",
    },
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join thousands of liquidity providers earning on Fluxion."
    >
      <Box as="form" onSubmit={handleSubmit}>
        {error && (
          <Alert status="error" borderRadius="md" mb={5} bg="red.900">
            <AlertIcon />
            <Text fontSize="sm">{error}</Text>
          </Alert>
        )}

        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4} mb={4}>
          <FormControl>
            <FormLabel fontSize="sm" color="gray.300">
              First name
            </FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiUser} color="gray.500" />
              </InputLeftElement>
              <Input
                placeholder="Ada"
                value={form.firstName}
                onChange={setField("firstName")}
                autoComplete="given-name"
                {...inputStyles}
              />
            </InputGroup>
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm" color="gray.300">
              Last name
            </FormLabel>
            <Input
              placeholder="Lovelace"
              value={form.lastName}
              onChange={setField("lastName")}
              autoComplete="family-name"
              {...inputStyles}
            />
          </FormControl>
        </Grid>

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
              value={form.email}
              onChange={setField("email")}
              autoComplete="email"
              {...inputStyles}
            />
          </InputGroup>
        </FormControl>

        <FormControl mb={3} isRequired>
          <FormLabel fontSize="sm" color="gray.300">
            Password
          </FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiLock} color="gray.500" />
            </InputLeftElement>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={form.password}
              onChange={setField("password")}
              autoComplete="new-password"
              {...inputStyles}
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

        {form.password && (
          <Box mb={4}>
            <Progress
              value={strengthPct}
              size="xs"
              colorScheme={strengthColor}
              borderRadius="full"
              mb={2}
            />
            <Grid templateColumns="1fr 1fr" gap={1}>
              {passwordRules.map((rule) => {
                const passed = rule.test(form.password);
                return (
                  <Text
                    key={rule.label}
                    fontSize="xs"
                    color={passed ? "green.400" : "gray.500"}
                  >
                    {passed ? "✓" : "○"} {rule.label}
                  </Text>
                );
              })}
            </Grid>
          </Box>
        )}

        <FormControl mb={5} isRequired>
          <FormLabel fontSize="sm" color="gray.300">
            Confirm password
          </FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={FiLock} color="gray.500" />
            </InputLeftElement>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={setField("confirmPassword")}
              autoComplete="new-password"
              {...inputStyles}
            />
          </InputGroup>
          {form.confirmPassword && form.confirmPassword !== form.password && (
            <Text fontSize="xs" color="red.400" mt={1}>
              Passwords do not match.
            </Text>
          )}
        </FormControl>

        <Checkbox
          colorScheme="brand"
          isChecked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
          mb={6}
          alignItems="start"
        >
          <Text fontSize="sm" color="gray.400">
            I agree to the{" "}
            <Text as="span" color="brand.300">
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text as="span" color="brand.300">
              Privacy Policy
            </Text>
            .
          </Text>
        </Checkbox>

        <Button
          type="submit"
          w="full"
          size="lg"
          colorScheme="brand"
          bgGradient="linear(to-r, brand.500, accent.500)"
          _hover={{ bgGradient: "linear(to-r, brand.600, accent.600)" }}
          isLoading={isSubmitting}
          loadingText="Creating account"
        >
          Create account
        </Button>

        <Flex justify="center" mt={6}>
          <Text fontSize="sm" color="gray.400">
            Already have an account?{" "}
            <Text
              as={RouterLink}
              to="/signin"
              color="brand.300"
              fontWeight="semibold"
              _hover={{ color: "brand.200" }}
            >
              Sign in
            </Text>
          </Text>
        </Flex>
      </Box>
    </AuthLayout>
  );
};

export default SignUp;
