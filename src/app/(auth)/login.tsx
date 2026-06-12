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
    <SafeAreaView className="flex-1 bg-white">
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
          <Text className="text-2xl font-bold text-gray-900 mb-1">Đăng nhập</Text>
          <Text className="text-gray-500 mb-8">Chào mừng bạn trở lại HistoryTalk!</Text>

          {/* Error banner */}
          {errorMessage ? (
            <View className="flex-row items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} color="#EF4444" />
              <Text className="text-red-600 text-sm flex-1">{errorMessage}</Text>
            </View>
          ) : null}

          {/* Email */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-2">Email</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  className={`flex-row items-center border rounded-xl px-4 h-14 bg-gray-50 ${
                    errors.email ? 'border-red-400' : 'border-gray-200'
                  }`}
                >
                  <Mail size={18} color={errors.email ? '#EF4444' : '#9CA3AF'} />
                  <TextInput
                    className="flex-1 ml-3 text-gray-900 text-base"
                    placeholder="your@email.com"
                    placeholderTextColor="#9CA3AF"
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
              <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-2">
            <Text className="text-sm font-medium text-gray-700 mb-2">Mật khẩu</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View
                  className={`flex-row items-center border rounded-xl px-4 h-14 bg-gray-50 ${
                    errors.password ? 'border-red-400' : 'border-gray-200'
                  }`}
                >
                  <Lock size={18} color={errors.password ? '#EF4444' : '#9CA3AF'} />
                  <TextInput
                    className="flex-1 ml-3 text-gray-900 text-base"
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                    {showPassword ? (
                      <EyeOff size={18} color="#9CA3AF" />
                    ) : (
                      <Eye size={18} color="#9CA3AF" />
                    )}
                  </Pressable>
                </View>
              )}
            />
            {errors.password && (
              <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</Text>
            )}
          </View>

          {/* Forgot password */}
          <TouchableOpacity className="self-end mb-8">
            <Text className="text-primary-500 text-sm font-medium">Quên mật khẩu?</Text>
          </TouchableOpacity>

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
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-400 text-sm">hoặc tiếp tục với</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Google */}
          <TouchableOpacity
            className="flex-row items-center justify-center border border-gray-200 rounded-xl h-14 mb-8 bg-white"
            onPress={() => googleAuth.signInWithGoogle()}
            disabled={!googleAuth.isReady || googleAuth.isPending}
            activeOpacity={0.85}
          >
            {googleAuth.isPending ? (
              <ActivityIndicator color="#208AEF" />
            ) : (
              <>
                {/* Google "G" logo */}
                <View className="w-6 h-6 rounded-full items-center justify-center mr-3">
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#4285F4' }}>G</Text>
                </View>
                <Text className="text-gray-700 font-medium text-base">Đăng nhập bằng Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Register link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-500">Chưa có tài khoản? </Text>
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
