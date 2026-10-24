import { useAuthCallback } from "@/hooks/useAuth";
import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Sentry from "@sentry/react-native";
import SocketConnection from "@/components/SocketConnection";

const AuthSync = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { mutate: syncUser, isSuccess, reset } = useAuthCallback();
  const hasSynced = useRef(false); // this is used to not run useEffect more than once

  useEffect(() => {
    if (isSignedIn && user && !hasSynced.current) {
      hasSynced.current = true;

      syncUser(undefined, {
        onSuccess: (data) => {
          console.log("✅ User synced with backend:", data.name);
          Sentry.logger.info(Sentry.logger.fmt`User synced with backend: ${data.name}`, {
            userId: user.id,
            userName: data.name,
          });
        },
        onError: (error) => {
          console.log("❌ User sync failed for the user:", error);
          Sentry.logger.error("Failed to sync user with backend", {
            userId: user.id,
            error: error instanceof Error ? error.message : String(error),
          });
        },
      });
    }

    if (!isSignedIn) {
      hasSynced.current = false;
      reset();
    }
  }, [isSignedIn, user, syncUser, reset]);

  return isSignedIn && isSuccess ? <SocketConnection /> : null;
};

export default AuthSync;
