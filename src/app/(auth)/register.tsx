import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { AlertCircle, Eye, EyeOff, Lock, Mail, User } from 'lucide-react-native';
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

import { MUTED } from '@/constants/palette';
import { useRegister } from '@/features/auth/hooks/use-register';
import { type RegisterInput, registerSchema } from '@/features/auth/schemas';

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const register = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { userName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = (data: RegisterInput) => register.mutate(data);

  return (
    <SafeAreaView className="flex-1 bg-[#F2E8D5]">
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
          <View className="items-center mb-8">
            <Image
              source={require('@/assets/logo_with_title.png')}
              style={{ width: 180, height: 64 }}
              resizeMode="contain"
            />
          </View>

          <Text className="text-2xl font-bold text-[#2B2118] mb-1">Tạo tài khoản</Text>
          <Text className="text-[#6B5B3E] mb-6">Tham gia cùng hàng nghìn người yêu lịch sử!</Text>

          {/* Error banner */}
          {register.error?.message ? (
            <View className="flex-row items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
              <AlertCircle size={16} color="#DC2626" />
              <Text className="text-red-700 text-sm flex-1">{register.error.message}</Text>
            </View>
          ) : null}

          {/* Success banner */}
          {register.isSuccess ? (
            <View className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
              <Text className="text-green-700 text-sm text-center">
                Đăng ký thành công! Đang chuyển đến trang đăng nhập...
              </Text>
            </View>
          ) : null}

          {/* Username */}
          <FieldWrapper label="Tên tài khoản" error={errors.userName?.message}>
            <Controller
              control={control}
              name="userName"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputRow icon={<User size={18} color={errors.userName ? '#DC2626' : MUTED} />} hasError={!!errors.userName}>
                  <TextInput
                    className="flex-1 ml-3 text-[#2B2118] text-base"
                    placeholder="nguyenvana"
                    placeholderTextColor={MUTED}
                    autoCapitalize="none"
                    autoComplete="username"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </InputRow>
              )}
            />
          </FieldWrapper>

          {/* Email */}
          <FieldWrapper label="Email" error={errors.email?.message}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputRow icon={<Mail size={18} color={errors.email ? '#DC2626' : MUTED} />} hasError={!!errors.email}>
                  <TextInput
                    className="flex-1 ml-3 text-[#2B2118] text-base"
                    placeholder="your@email.com"
                    placeholderTextColor={MUTED}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </InputRow>
              )}
            />
          </FieldWrapper>

          {/* Password */}
          <FieldWrapper label="Mật khẩu" error={errors.password?.message}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputRow icon={<Lock size={18} color={errors.password ? '#DC2626' : MUTED} />} hasError={!!errors.password}>
                  <TextInput
                    className="flex-1 ml-3 text-[#2B2118] text-base"
                    placeholder="••••••••"
                    placeholderTextColor={MUTED}
                    secureTextEntry={!showPassword}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                    {showPassword ? <EyeOff size={18} color={MUTED} /> : <Eye size={18} color={MUTED} />}
                  </Pressable>
                </InputRow>
              )}
            />
          </FieldWrapper>

          {/* Confirm Password */}
          <FieldWrapper label="Xác nhận mật khẩu" error={errors.confirmPassword?.message}>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <InputRow icon={<Lock size={18} color={errors.confirmPassword ? '#DC2626' : MUTED} />} hasError={!!errors.confirmPassword}>
                  <TextInput
                    className="flex-1 ml-3 text-[#2B2118] text-base"
                    placeholder="••••••••"
                    placeholderTextColor={MUTED}
                    secureTextEntry={!showConfirm}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                  <Pressable onPress={() => setShowConfirm((v) => !v)} hitSlop={8}>
                    {showConfirm ? <EyeOff size={18} color={MUTED} /> : <Eye size={18} color={MUTED} />}
                  </Pressable>
                </InputRow>
              )}
            />
          </FieldWrapper>

          {/* Submit */}
          <TouchableOpacity
            className={`rounded-xl h-14 items-center justify-center mt-2 mb-6 ${
              register.isPending ? 'bg-primary-300' : 'bg-primary-500'
            }`}
            onPress={handleSubmit(onSubmit)}
            disabled={register.isPending || register.isSuccess}
            activeOpacity={0.85}
          >
            {register.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">Tạo tài khoản</Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <View className="flex-row justify-center">
            <Text className="text-[#6B5B3E]">Đã có tài khoản? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-primary-500 font-semibold">Đăng nhập</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldWrapper({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-[#6B5B3E] mb-2">{label}</Text>
      {children}
      {error && <Text className="text-red-600 text-xs mt-1 ml-1">{error}</Text>}
    </View>
  );
}

function InputRow({
  icon,
  hasError,
  children,
}: {
  icon: React.ReactNode;
  hasError: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      className={`flex-row items-center border rounded-xl px-4 h-14 bg-[#FBF6EA] ${
        hasError ? 'border-red-400' : 'border-[#DCC9A0]'
      }`}
    >
      {icon}
      {children}
    </View>
  );
}
