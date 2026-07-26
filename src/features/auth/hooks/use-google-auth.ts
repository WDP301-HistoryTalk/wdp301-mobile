import { useMutation } from '@tanstack/react-query';
import { AccessTokenRequest, makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

import { authApi } from '../api';
import { useAuthStore } from '../store';

WebBrowser.maybeCompleteAuthSession();

const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Google's Android/iOS OAuth client types don't accept an arbitrary redirect_uri
// (that's why the console shows "Custom URI scheme: not recommended for Android
// clients") — they only accept the "reversed client ID" scheme, e.g.
// "32246262095-xxx.apps.googleusercontent.com" -> "com.googleusercontent.apps.32246262095-xxx".
// This matches the intentFilters scheme registered in app.json. Any other custom
// scheme (app scheme, package name, ...) gets a 400 invalid_request from Google.
function reversedClientId(clientId?: string): string | undefined {
  return clientId?.split('.').reverse().join('.');
}

export function useGoogleAuth() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const nativeClientId = Platform.OS === 'ios' ? iosClientId : androidClientId;
  const redirectUri = makeRedirectUri({ native: `${reversedClientId(nativeClientId)}:/oauthredirect` });

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId,
    iosClientId,
    redirectUri,
  });

  const mutation = useMutation({
    mutationFn: (idToken: string) => authApi.googleLogin(idToken),
    onSuccess: async (data) => {
      await setAuth(data);
      router.replace('/');
    },
  });
  const { mutate } = mutation;

  // Trên native, useIdTokenAuthRequest vẫn dùng response_type=code (không phải
  // id_token) — promptAsync() chỉ resolve với authorization `code`, id_token
  // chỉ xuất hiện sau bước exchange code, và bước đó (bên trong thư viện Google
  // provider) chạy trong 1 useEffect riêng, dính đúng lỗi unmount-trước-khi-
  // effect-chạy mà useGoogleAuth từng mắc phải. Nên tự thực hiện exchange ngay
  // tại đây, trong cùng 1 async function với promptAsync(), để nó chạy xong bất
  // kể component gọi nó có unmount hay không.
  const signInWithGoogle = async () => {
    const result = await promptAsync();
    if (result.type !== 'success') return;

    const { code } = result.params;
    if (!code || !request?.codeVerifier || !nativeClientId) return;

    const exchange = await new AccessTokenRequest({
      clientId: nativeClientId,
      code,
      redirectUri,
      extraParams: { code_verifier: request.codeVerifier },
    }).performAsync(Google.discovery);

    if (exchange.idToken) mutate(exchange.idToken);
  };

  return {
    signInWithGoogle,
    isReady: !!request,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
