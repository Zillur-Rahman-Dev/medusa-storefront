import { Button, Heading, Text } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-white flex items-center justify-between">
      <div>
        <Heading level="h2" className="txt-xlarge font-bold">
          আপনার কি ইতিমধ্যে অ্যাকাউন্ট আছে?
        </Heading>
        <Text className="txt-medium text-ui-fg-subtle mt-1">
          সহজ ও দ্রুত অর্ডারের জন্য লগইন করুন।
        </Text>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <Button variant="secondary" className="h-10 font-bold" data-testid="sign-in-button">
            লগইন করুন
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
