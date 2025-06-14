import { VStack } from "@/components/ui/vstack";
import { Heading } from "@/components/ui/heading";

interface WelcomeHeaderProps {
  fullName?: string;
}

export const WelcomeHeader = ({ fullName }: WelcomeHeaderProps) => {
  return (
    <VStack className="w-full">
      <Heading
        className="font-normal text-secondary-300 tracking-tight text-2xl"
        style={{ fontFamily: "BGSB" }}
      >
        Welcome,
      </Heading>
      <Heading
        className="font-medium text-typography-950 tracking-tight text-2xl"
        style={{ fontFamily: "BGSB" }}
      >
        {fullName || "Guest"}.
      </Heading>
    </VStack>
  );
};
