import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GoogleIcon } from '@/components/google-icon';
import { MUTED, ORANGE } from '@/constants/palette';
import { useGoogleAuth } from '@/features/auth/hooks/use-google-auth';
import { useLogin } from '@/features/auth/hooks/use-login';
import { type LoginInput, loginSchema } from '@/features/auth/schemas';

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const googleAuth = useGoogleAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginInput) => login.mutate(data);

  const errorMessage = login.error?.message ?? googleAuth.error?.message;

  return (
    <SafeAreaView className="flex-1 bg-history-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 pt-8 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View className="items-center mb-10">
            <Image
              source={require('@/assets/logo_with_title.png')}
              style={{ width: 200, height: 72 }}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <Text className="text-2xl font-bold text-history-text mb-1">Đăng nhập</Text>
          <Text className="text-history-muted mb-8">Chào mừng bạn trở lại HistoryTalk!</Text>

          {/* Error banner */}
          {errorMessage ? (
            <View className="flex-row items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} color="#9A3F43" />
              <Text className="text-red-700 text-sm flex-1">{errorMessage}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-history-muted mb-2">Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  className={`flex-row items-center border rounded-xl px-4 h-14 bg-history-surface ${
                    errors.email ? 'border-red-400' : 'border-history-border'
                  }`}
                >
                  <Mail size={18} color={errors.email ? '#9A3F43' : MUTED} />
                  <TextInput
                    className="flex-1 ml-3 text-history-text text-base"
                    placeholder="your@email.com"
                    placeholderTextColor={MUTED}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
              )}
            />
            {errors.email && (
              <Text className="text-red-600 text-xs mt-1 ml-1">{errors.email.message}</Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-2">
            <Text className="text-sm font-medium text-history-muted mb-2">Mật khẩu</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  className={`flex-row items-center border rounded-xl px-4 h-14 bg-history-surface ${
                    errors.password ? 'border-red-400' : 'border-history-border'
                  }`}
                >
                  <Lock size={18} color={errors.password ? '#9A3F43' : MUTED} />
                  <TextInput
                    className="flex-1 ml-3 text-history-text text-base"
                    placeholder="••••••••"
                    placeholderTextColor={MUTED}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                    {showPassword ? (
                      <EyeOff size={18} color={MUTED} />
                    ) : (
                      <Eye size={18} color={MUTED} />
                    )}
                  </Pressable>
                </View>
              )}
            />
            {errors.password && (
              <Text className="text-red-600 text-xs mt-1 ml-1">{errors.password.message}</Text>
            )}
          </View>

          {/* Forgot password */}
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity className="self-end mb-8">
              <Text className="text-primary-500 text-sm font-medium">Quên mật khẩu?</Text>
            </TouchableOpacity>
          </Link>

          {/* Submit */}
          <TouchableOpacity
            className={`rounded-xl h-14 items-center justify-center mb-5 ${
              login.isPending ? 'bg-primary-300' : 'bg-primary-500'
            }`}
            onPress={handleSubmit(onSubmit)}
            disabled={login.isPending}
            activeOpacity={0.85}
          >
            {login.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center mb-5">
            <View className="flex-1 h-px bg-history-border" />
            <Text className="mx-4 text-history-muted text-sm">hoặc tiếp tục với</Text>
            <View className="flex-1 h-px bg-history-border" />
          </View>

          {/* Google */}
          <TouchableOpacity
            className="flex-row items-center justify-center border border-history-border rounded-xl h-14 mb-8 bg-history-surface"
            onPress={() => googleAuth.signInWithGoogle()}
            disabled={!googleAuth.isReady || googleAuth.isPending}
            activeOpacity={0.85}
          >
            {googleAuth.isPending ? (
              <ActivityIndicator color={ORANGE} />
            ) : (
              <>
                {/* Google SVG logo */}
                <View className="mr-3">
                  <GoogleIcon size={20} />
                </View>
                <Text className="text-history-text font-medium text-base">Đăng nhập bằng Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Register link */}
          <View className="flex-row justify-center">
            <Text className="text-history-muted">Chưa có tài khoản? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-primary-500 font-semibold">Đăng ký ngay</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
