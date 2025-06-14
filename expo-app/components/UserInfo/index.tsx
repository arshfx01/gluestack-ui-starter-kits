import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  Alert,
} from "react-native";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { Badge, BadgeText } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  ChevronRight,
  ChevronDown,
} from "lucide-react-native";

type UserInfoCardProps = {
  user: {
    email?: string;
    phoneNumber?: string;
    metadata?: { creationTime?: string };
  };
  loginMethod: string;
  joinedAgo: string;
};

const styles = StyleSheet.create({
  touchableHighlight: {
    opacity: 0.6, // Subtle press feedback
  },
});

const UserInfoCard: React.FC<UserInfoCardProps> = ({
  user,
  loginMethod,
  joinedAgo,
}) => {
  const [isContactExpanded, setIsContactExpanded] = useState(true);
  const [isAccountExpanded, setIsAccountExpanded] = useState(true);

  const copyToClipboard = (text: string, type: string) => {
    Clipboard.setString(text);
    Alert.alert("Copied", `${type} copied to clipboard!`);
  };

  return (
    <View className="w-full bg-background-50 border-border-200 border rounded-xl">
      <VStack className="w-full">
        {/* Contact Information Section */}
        <HStack className="items-center justify-between p-2 py-4 border-b border-border-200">
          <HStack className="items-center space-x-2" space="md">
            <User size={20} color="#6b7280" />
            <Text className="text-lg font-semibold text-typography-900">
              Contact Information
            </Text>
          </HStack>
          <TouchableOpacity
            onPress={() => setIsContactExpanded(!isContactExpanded)}
            accessibilityLabel={
              isContactExpanded
                ? "Collapse Contact Information"
                : "Expand Contact Information"
            }
            activeOpacity={0.6}
          >
            {isContactExpanded ? (
              <ChevronDown size={20} color="#6b7280" />
            ) : (
              <ChevronRight size={20} color="#6b7280" />
            )}
          </TouchableOpacity>
        </HStack>

        {isContactExpanded && (
          <>
            {user?.email && (
              <HStack
                space="md"
                className="items-center p-2 py-4 border-b border-border-200"
              >
                <Mail size={16} color="#6b7280" />
                <TouchableOpacity
                  onPress={() => copyToClipboard(user.email!, "Email")}
                  accessibilityLabel={`Copy email: ${user.email}`}
                >
                  <Text className="text-typography-500">{user.email}</Text>
                </TouchableOpacity>
              </HStack>
            )}
            {user?.phoneNumber && (
              <HStack
                space="md"
                className="items-center p-2 py-4 border-b border-border-200"
              >
                <Phone size={16} color="#6b7280" />
                <TouchableOpacity
                  onPress={() =>
                    copyToClipboard(user.phoneNumber!, "Phone number")
                  }
                  accessibilityLabel={`Copy phone number: ${user.phoneNumber}`}
                >
                  <Text className="text-typography-500">
                    {user.phoneNumber}
                  </Text>
                </TouchableOpacity>
              </HStack>
            )}
          </>
        )}

        {/* Account Information Section */}
        <VStack>
          <HStack className="items-center justify-between p-2 py-4 border-b border-border-200">
            <HStack className="items-center space-x-2" space="md">
              <Shield size={20} color="#6b7280" />
              <Text className="text-lg font-semibold text-typography-900">
                Account Information
              </Text>
            </HStack>
            <TouchableOpacity
              onPress={() => setIsAccountExpanded(!isAccountExpanded)}
              accessibilityLabel={
                isAccountExpanded
                  ? "Collapse Account Information"
                  : "Expand Account Information"
              }
              activeOpacity={0.6}
            >
              {isAccountExpanded ? (
                <ChevronDown size={20} color="#6b7280" />
              ) : (
                <ChevronRight size={20} color="#6b7280" />
              )}
            </TouchableOpacity>
          </HStack>

          {isAccountExpanded && (
            <>
              <HStack
                space="xs"
                className="items-center p-2 py-4 border-b border-border-200"
              >
                <Badge
                  className="rounded-md px-2 py-[1px] bg-background-100"
                  variant="outline"
                  action="muted"
                  size="sm"
                >
                  <BadgeText className="text-xs font-bold text-primary-900">
                    Logged in with {loginMethod}
                  </BadgeText>
                </Badge>
              </HStack>
              <HStack space="md" className="items-center p-2 py-4">
                <Calendar size={16} color="#6b7280" />
                <Text className="text-typography-500">Joined {joinedAgo}</Text>
              </HStack>
            </>
          )}
        </VStack>
      </VStack>
    </View>
  );
};

export default UserInfoCard;
