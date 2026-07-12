import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from 'lucide-react-native';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GREEN, MUTED } from '@/constants/palette';
import { useForgotPassword } from '@/features/auth/hooks/use-forgot-password';
import { type ForgotPasswordInput, forgotPasswordSchema } from '@/features/auth/schemas';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const forgot = useForgotPassword();

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (data: ForgotPasswordInput) => forgot.mutate(data.email);

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
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-history-surface items-center justify-center mb-8"
            accessibilityLabel="Quay lại đăng nhập"
          >
            <ArrowLeft size={20} color={MUTED} />
          </TouchableOpacity>

          {/* Heading */}
          <Text className="text-2xl font-bold text-history-text mb-1">Quên mật khẩu</Text>
          <Text className="text-history-muted mb-8">
            Nhập email đã đăng ký, chúng tôi sẽ gửi đường dẫn đặt lại mật khẩu cho bạn.
          </Text>

          {forgot.isSuccess ? (
            /* Success state */
            <View className="items-center gap-3 bg-history-surface border border-history-border rounded-2xl px-6 py-10">
              <CheckCircle2 size={40} color={GREEN} strokeWidth={1.75} />
              <Text className="text-history-text font-semibold text-base text-center">
                Đã gửi email đặt lại mật khẩu
              </Text>
              <Text className="text-history-muted text-sm text-center">
                Kiểm tra hộp thư của {getValues('email')} (kể cả mục spam). Đường dẫn có hiệu lực
                trong 10 phút.
              </Text>
              <TouchableOpacity
                onPress={() => router.back()}
                className="mt-4 rounded-xl h-12 px-8 items-center justify-center bg-primary-500"
                activeOpacity={0.85}
              >
                <Text className="text-white font-semibold">Về đăng nhập</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Error banner */}
              {forgot.error ? (
                <View className="flex-row items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5">
                  <AlertCircle size={16} color="#9A3F43" />
                  <Text className="text-red-700 text-sm flex-1">{forgot.error.message}</Text>
                </View>
              ) : null}

              {/* Email */}
              <View className="mb-8">
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

              {/* Submit */}
              <TouchableOpacity
                className={`rounded-xl h-14 items-center justify-center ${
                  forgot.isPending ? 'bg-primary-300' : 'bg-primary-500'
                }`}
                onPress={handleSubmit(onSubmit)}
                disabled={forgot.isPending}
                activeOpacity={0.85}
              >
                {forgot.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-semibold text-base">Gửi đường dẫn</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
