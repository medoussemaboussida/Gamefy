import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Gamefy - Sign In"
        description="Gamefy - Sign in"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
