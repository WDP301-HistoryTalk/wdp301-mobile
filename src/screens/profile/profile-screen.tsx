import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  AlertCircle, ArrowLeft, Calendar, Camera, CheckCircle2, ChevronDown, ChevronUp, Crown,
  Eye, EyeOff, KeyRound, Lock, LogOut, Mail, MapPin, Phone, Receipt, Save, Trophy, User, UserCircle, X,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
  Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import {
  BORDER,
  CARD,
  GREEN,
  MUTED,
  ORANGE,
  ORANGE_BORDER,
  ORANGE_BORDER_FOCUS,
  ORANGE_BORDER_MEDIUM,
  ORANGE_TINT,
  ORANGE_TINT_MUTED,
  ORANGE_TINT_SOFT,
  RED,
  SURFACE,
  TEXT,
  TEXT_TINT_SOFT,
  TEXT2,
} from '@/constants/palette';
import { useChangePassword } from '@/features/auth/hooks/use-change-password';
import { useMe } from '@/features/auth/hooks/use-me';
import { useUpdateMe } from '@/features/auth/hooks/use-update-me';
import { useUploadAvatar } from '@/features/auth/hooks/use-upload-avatar';
import { useAuthStore } from '@/features/auth/store';
import type { UpdateProfileInput } from '@/features/auth/types';
import { userApi } from '@/features/auth/user-api';
import { useTiers } from '@/features/payment/hooks/use-tiers';

const ROLE_LABEL: Record<string, string> = {
  CUSTOMER:      'Người dùng',
  CONTENT_ADMIN: 'Quản trị nội dung',
  SYSTEM_ADMIN:  'Quản trị hệ thống',
};

const GENDER_OPTS = [
  { value: 'MALE',   label: 'Nam'  },
  { value: 'FEMALE', label: 'Nữ'   },
  { value: 'OTHER',  label: 'Khác' },
] as const;

// ─── helpers ──────────────────────────────────────────────────────────────────
function formatDob(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function parseDob(display: string): string | undefined {
  // accept DD/MM/YYYY or YYYY-MM-DD
  if (!display) return undefined;
  const parts = display.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return display;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('vi-VN');
}

// ─── sub-components ───────────────────────────────────────────────────────────
function Field({ label, value, icon: Icon }: { label: string; value?: string; icon: any }) {
  return (
    <View style={s.fieldRow}>
      <View style={s.fieldIcon}>
        <Icon size={15} color={MUTED} strokeWidth={1.75} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.fieldLabel}>{label}</Text>
        <Text style={s.fieldValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

function InputField({
  label, value, onChange, placeholder, icon: Icon, keyboardType, multiline,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; icon: any; keyboardType?: any; multiline?: boolean;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.inputLabel}>{label}</Text>
      <View style={s.inputWrap}>
        <Icon size={15} color={MUTED} strokeWidth={1.75} style={{ marginRight: 10 }} />
        <TextInput
          style={[s.input, multiline && { height: 72, textAlignVertical: 'top' }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder ?? label}
          placeholderTextColor={MUTED}
          keyboardType={keyboardType}
          multiline={multiline}
        />
      </View>
    </View>
  );
}

function PasswordInput({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.inputLabel}>{label}</Text>
      <View style={s.inputWrap}>
        <Lock size={15} color={MUTED} strokeWidth={1.75} style={{ marginRight: 10 }} />
        <TextInput
          style={[s.input, { flex: 1 }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder ?? label}
          placeholderTextColor={MUTED}
          secureTextEntry={!visible}
          autoCapitalize="none"
        />
        <Pressable onPress={() => setVisible((v) => !v)} style={{ paddingHorizontal: 4 }}>
          {visible
            ? <EyeOff size={16} color={MUTED} strokeWidth={1.75} />
            : <Eye    size={16} color={MUTED} strokeWidth={1.75} />}
        </Pressable>
      </View>
    </View>
  );
}

// ─── screen ───────────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const { data: profile, isLoading, isError, refetch: refetchMe } = useMe();
  const { data: tiers, refetch: refetchTiers } = useTiers();
  const [refreshing, setRefreshing] = useState(false);
  async function onRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([refetchMe(), refetchTiers()]);
    } finally {
      setRefreshing(false);
    }
  }
  const { mutateAsync: updateMe, isPending: saving }         = useUpdateMe();
  const { mutateAsync: changePwd, isPending: changingPwd }   = useChangePassword();
  const { mutateAsync: uploadAvatar, isPending: uploadingAvatar } = useUploadAvatar();

  // avatarUrl tra ve tu API co the la link ngoai (vd Google) dung duoc thang,
  // hoac 1 storage path noi bo (sau khi upload) — phai doi lay signed URL
  // moi xem duoc. Cache tam URL vua upload de hien ngay, khong doi round-trip.
  const [freshAvatarUrl, setFreshAvatarUrl] = useState<string | null>(null);
  const rawAvatarUrl = profile?.avatarUrl;
  const isDirectAvatarUrl = !!rawAvatarUrl && /^https?:\/\//.test(rawAvatarUrl);
  const { data: signedAvatar } = useQuery({
    queryKey: ['avatar-view-url', profile?._id, rawAvatarUrl],
    queryFn: () => userApi.getAvatarViewUrl(profile!._id),
    enabled: !!profile?._id && !!rawAvatarUrl && !isDirectAvatarUrl,
    staleTime: 1000 * 60 * 30,
  });
  const avatarDisplayUrl =
    freshAvatarUrl ?? (isDirectAvatarUrl ? rawAvatarUrl : signedAvatar?.url);

  function pickAndUploadAvatar() {
    if (!profile) return;
    Alert.alert('Đổi ảnh đại diện', undefined, [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Chụp ảnh', onPress: () => void handlePickAvatar('camera') },
      { text: 'Chọn từ thư viện', onPress: () => void handlePickAvatar('library') },
    ]);
  }

  async function handlePickAvatar(source: 'camera' | 'library') {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Thiếu quyền truy cập', 'Hãy cấp quyền camera/thư viện ảnh để đổi ảnh đại diện.');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1] })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1] });

    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];

    try {
      const uploaded = await uploadAvatar({
        userId: profile!._id,
        file: {
          uri: asset.uri,
          name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
          type: asset.mimeType ?? 'image/jpeg',
        },
      });
      setFreshAvatarUrl(uploaded.url);
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không thể tải lên ảnh đại diện.');
    }
  }

  const activeTier = tiers?.find((t) => t.tierId === profile?.tierId);
  const tierName = activeTier ? activeTier.title : 'Gói Miễn phí';

  // edit state
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<{
    userName: string; fullName: string; dob: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER' | '';
    phoneNumber: string; address: string;
  }>({ userName: '', fullName: '', dob: '', gender: '', phoneNumber: '', address: '' });

  // change password state
  const [pwdOpen,    setPwdOpen]    = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdNew,     setPwdNew]     = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');

  const initial = profile?.userName?.charAt(0).toUpperCase() ?? 'U';

  function startEdit() {
    if (!profile) return;
    setForm({
      userName:    profile.userName    ?? '',
      fullName:    profile.fullName    ?? '',
      dob:         formatDob(profile.dob),
      gender:      (profile.gender as any) ?? '',
      phoneNumber: profile.phoneNumber ?? '',
      address:     profile.address    ?? '',
    });
    setEditing(true);
  }

  async function submitEdit() {
    const payload: UpdateProfileInput = {};
    if (form.userName)    payload.userName    = form.userName;
    if (form.fullName)    payload.fullName    = form.fullName;
    if (form.phoneNumber) payload.phoneNumber = form.phoneNumber;
    if (form.address)     payload.address     = form.address;
    if (form.gender)      payload.gender      = form.gender;
    if (form.dob)         payload.dob         = parseDob(form.dob) ?? form.dob;

    try {
      await updateMe(payload);
      setEditing(false);
      Alert.alert('Thành công', 'Hồ sơ đã được cập nhật.');
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không thể cập nhật hồ sơ.');
    }
  }

  async function submitChangePassword() {
    if (!pwdCurrent || !pwdNew || !pwdConfirm) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (pwdNew !== pwdConfirm) {
      Alert.alert('Lỗi', 'Mật khẩu mới không khớp.');
      return;
    }
    try {
      await changePwd({ currentPassword: pwdCurrent, newPassword: pwdNew, confirmPassword: pwdConfirm });
      setPwdOpen(false);
      setPwdCurrent(''); setPwdNew(''); setPwdConfirm('');
      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi.');
    } catch (e: any) {
      Alert.alert('Lỗi', e?.message ?? 'Không thể đổi mật khẩu.');
    }
  }

  function confirmLogout() {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất không?', [
      { text: 'Huỷ',       style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: () => void logout() },
    ]);
  }

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }} edges={['top']}>
      {/* header bar */}
      <View style={s.headerBar}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={s.backBtn} accessibilityLabel="Quay lại">
          <ArrowLeft size={20} color={TEXT} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Hồ sơ cá nhân</Text>
        {editing ? (
          <TouchableOpacity onPress={() => setEditing(false)} activeOpacity={0.7} style={s.backBtn} accessibilityLabel="Hủy chỉnh sửa">
            <X size={20} color={MUTED} strokeWidth={2} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={ORANGE} />
          }
        >

          {isLoading && <ProfileSkeleton />}

          {isError && (
            <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
              <AlertCircle size={40} color={RED} strokeWidth={1.5} />
              <Text style={{ color: TEXT2, fontSize: 15 }}>Không thể tải hồ sơ</Text>
              <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: CARD, borderRadius: 12 }}>
                <Text style={{ color: TEXT }}>Quay lại</Text>
              </TouchableOpacity>
            </View>
          )}

          {profile && (
            <>
              {/* ── Avatar hero ─────────────────────────────────── */}
              <View style={s.heroSection}>
                <Pressable onPress={pickAndUploadAvatar} style={s.avatarRing}>
                  <View style={s.avatar}>
                    {avatarDisplayUrl ? (
                      <Image source={{ uri: avatarDisplayUrl }} style={s.avatarImage} contentFit="cover" />
                    ) : (
                      <Text style={s.avatarInitial}>{initial}</Text>
                    )}
                    {uploadingAvatar ? (
                      <View style={s.avatarLoadingOverlay}>
                        <ActivityIndicator color="#fff" size="small" />
                      </View>
                    ) : null}
                  </View>
                  <View style={s.avatarEditBadge}>
                    <Camera size={13} color="#fff" strokeWidth={2.2} />
                  </View>
                </Pressable>
                <Text style={s.heroName}>{profile.userName}</Text>
                <Text style={s.heroEmail}>{profile.email}</Text>
                <View style={s.roleBadge}>
                  <Text style={s.roleBadgeText}>{ROLE_LABEL[profile.role] ?? profile.role}</Text>
                </View>
              </View>

              {/* ── Token & join date stats ──────────────────────── */}
              <View style={s.statsRow}>
                <View style={[s.statCard, { borderRightWidth: 1, borderRightColor: BORDER }]}>
                  <Text style={s.statValue}>{(profile.token ?? 0).toLocaleString('vi-VN')}</Text>
                  <Text style={s.statLabel}>Token còn lại</Text>
                </View>
                <View style={s.statCard}>
                  <Text style={s.statValue}>{formatDate(profile.createdAt)}</Text>
                  <Text style={s.statLabel}>Ngày tham gia</Text>
                </View>
              </View>

              {/* ── Subscription / payment ───────────────────────── */}
              <View style={s.section}>
                <View style={s.sectionHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Crown size={17} color={ORANGE} strokeWidth={1.75} />
                    <Text style={s.sectionTitle}>Gói dịch vụ</Text>
                  </View>
                </View>
                
                {/* Current Active Package Box */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: SURFACE,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: BORDER,
                  marginTop: 8,
                  marginBottom: 4,
                }}>
                  <View style={{ gap: 4 }}>
                    <Text style={{ color: MUTED, fontSize: 11, fontWeight: '600' }}>Gói hiện tại</Text>
                    <Text style={{ color: TEXT, fontSize: 15, fontWeight: '800', textTransform: 'capitalize' }}>
                      {tierName}
                    </Text>
                  </View>
                  {activeTier && activeTier.amount > 0 ? (
                    <View style={{ backgroundColor: ORANGE_TINT, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: ORANGE_BORDER_MEDIUM }}>
                      <Text style={{ color: ORANGE, fontSize: 10, fontWeight: '800' }}>PRO</Text>
                    </View>
                  ) : (
                    <View style={{ backgroundColor: 'rgba(100,116,139,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(100,116,139,0.2)' }}>
                      <Text style={{ color: MUTED, fontSize: 10, fontWeight: '800' }}>FREE</Text>
                    </View>
                  )}
                </View>

                <View style={{ gap: 10, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => router.push('/payment')}
                    activeOpacity={0.8}
                    style={s.upgradeBtn}
                  >
                    <Crown size={16} color="#fff" strokeWidth={2} />
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Nâng cấp gói Pro</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push('/payment/history')}
                    activeOpacity={0.8}
                    style={s.historyBtn}
                  >
                    <Receipt size={16} color={TEXT2} strokeWidth={1.75} />
                    <Text style={{ color: TEXT2, fontWeight: '600', fontSize: 14 }}>Lịch sử thanh toán</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => router.push('/quiz/history')}
                    activeOpacity={0.8}
                    style={s.historyBtn}
                  >
                    <Trophy size={16} color={TEXT2} strokeWidth={1.75} />
                    <Text style={{ color: TEXT2, fontWeight: '600', fontSize: 14 }}>Lịch sử làm quiz</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* ── Personal info ────────────────────────────────── */}
              <View style={s.section}>
                <View style={s.sectionHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <UserCircle size={17} color={ORANGE} strokeWidth={1.75} />
                    <Text style={s.sectionTitle}>Thông tin cá nhân</Text>
                  </View>
                  {!editing && (
                    <TouchableOpacity onPress={startEdit} activeOpacity={0.7} style={s.editBtn}>
                      <Text style={s.editBtnText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {!editing ? (
                  /* View mode */
                  <View style={{ gap: 2 }}>
                    <Field label="Tên đầy đủ"    value={profile.fullName}    icon={User}     />
                    <Field label="Ngày sinh"      value={formatDob(profile.dob)} icon={Calendar} />
                    <Field label="Số điện thoại" value={profile.phoneNumber} icon={Phone}    />
                    <Field label="Địa chỉ"        value={profile.address}     icon={MapPin}   />
                    <Field label="Email"           value={profile.email}       icon={Mail}     />
                    {profile.gender && (
                      <Field
                        label="Giới tính"
                        value={profile.gender === 'MALE' ? 'Nam' : profile.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                        icon={User}
                      />
                    )}
                  </View>
                ) : (
                  /* Edit mode */
                  <View>
                    <InputField label="Tên người dùng"  value={form.userName}    onChange={(v) => setForm((f) => ({ ...f, userName: v }))}    icon={User}  />
                    <InputField label="Tên đầy đủ"       value={form.fullName}    onChange={(v) => setForm((f) => ({ ...f, fullName: v }))}    icon={User}  placeholder="Nguyễn Văn A" />
                    <InputField label="Ngày sinh"         value={form.dob}         onChange={(v) => setForm((f) => ({ ...f, dob: v }))}         icon={Calendar} placeholder="DD/MM/YYYY" />
                    <InputField label="Số điện thoại"    value={form.phoneNumber} onChange={(v) => setForm((f) => ({ ...f, phoneNumber: v }))} icon={Phone} keyboardType="phone-pad" />
                    <InputField label="Địa chỉ"           value={form.address}     onChange={(v) => setForm((f) => ({ ...f, address: v }))}     icon={MapPin} multiline />

                    {/* Gender picker */}
                    <View style={{ marginBottom: 14 }}>
                      <Text style={s.inputLabel}>Giới tính</Text>
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                        {GENDER_OPTS.map(({ value, label }) => (
                          <TouchableOpacity
                            key={value}
                            onPress={() => setForm((f) => ({ ...f, gender: value }))}
                            activeOpacity={0.7}
                            style={[
                              s.genderBtn,
                              form.gender === value && s.genderBtnActive,
                            ]}
                          >
                            <Text style={{ color: form.gender === value ? ORANGE : TEXT2, fontSize: 13, fontWeight: '600' }}>
                              {label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Save button */}
                    <TouchableOpacity
                      onPress={submitEdit}
                      disabled={saving}
                      activeOpacity={0.8}
                      style={s.saveBtn}
                    >
                      {saving
                        ? <ActivityIndicator color="#fff" size="small" />
                        : (
                          <>
                            <Save size={16} color="#fff" strokeWidth={2} />
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Lưu thay đổi</Text>
                          </>
                        )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* ── Change password ──────────────────────────────── */}
              <View style={s.section}>
                <TouchableOpacity
                  onPress={() => setPwdOpen((v) => !v)}
                  activeOpacity={0.7}
                  style={s.sectionHeader}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <KeyRound size={17} color={ORANGE} strokeWidth={1.75} />
                    <Text style={s.sectionTitle}>Đổi mật khẩu</Text>
                  </View>
                  {pwdOpen
                    ? <ChevronUp   size={18} color={MUTED} strokeWidth={1.75} />
                    : <ChevronDown size={18} color={MUTED} strokeWidth={1.75} />}
                </TouchableOpacity>

                {pwdOpen && (
                  <View style={{ marginTop: 16 }}>
                    <PasswordInput label="Mật khẩu hiện tại" value={pwdCurrent} onChange={setPwdCurrent} placeholder="••••••••" />
                    <PasswordInput label="Mật khẩu mới"      value={pwdNew}     onChange={setPwdNew}     placeholder="••••••••" />
                    <PasswordInput label="Xác nhận mật khẩu" value={pwdConfirm} onChange={setPwdConfirm} placeholder="••••••••" />

                    {pwdNew && pwdConfirm && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        {pwdNew === pwdConfirm
                          ? <><CheckCircle2 size={14} color={GREEN} strokeWidth={2} /><Text style={{ color: GREEN, fontSize: 12 }}>Mật khẩu khớp</Text></>
                          : <><AlertCircle  size={14} color={RED}   strokeWidth={2} /><Text style={{ color: RED,   fontSize: 12 }}>Mật khẩu không khớp</Text></>}
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={submitChangePassword}
                      disabled={changingPwd}
                      activeOpacity={0.8}
                      style={s.saveBtn}
                    >
                      {changingPwd
                        ? <ActivityIndicator color="#fff" size="small" />
                        : (
                          <>
                            <Lock size={16} color="#fff" strokeWidth={2} />
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Cập nhật mật khẩu</Text>
                          </>
                        )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* ── Logout ──────────────────────────────────────────── */}
              <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
                <TouchableOpacity onPress={confirmLogout} activeOpacity={0.8} style={s.logoutBtn}>
                  <LogOut size={18} color={RED} strokeWidth={2} />
                  <Text style={{ color: RED, fontWeight: '700', fontSize: 15 }}>Đăng xuất</Text>
                </TouchableOpacity>
              </View>

              {/* account status */}
              <View style={{ alignItems: 'center', marginTop: 28 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: profile.isActive ? GREEN : RED }} />
                  <Text style={{ color: MUTED, fontSize: 12 }}>
                    Tài khoản {profile.isActive ? 'đang hoạt động' : 'bị khóa'}
                  </Text>
                </View>
                <Text style={{ color: MUTED, fontSize: 11, marginTop: 4 }}>
                  Cập nhật lần cuối: {formatDate(profile.updatedAt)}
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── skeleton ─────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <View>
      <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 28 }}>
        <Skeleton style={{ width: 88, height: 88, borderRadius: 44, marginBottom: 14 }} />
        <Skeleton style={{ width: 140, height: 18, borderRadius: 8, marginBottom: 8 }} />
        <Skeleton style={{ width: 200, height: 13, borderRadius: 6, marginBottom: 12 }} />
        <Skeleton style={{ width: 100, height: 24, borderRadius: 10 }} />
      </View>
      <View style={{ marginHorizontal: 20, gap: 12 }}>
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} style={{ height: 52, borderRadius: 14 }} />
        ))}
      </View>
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  headerBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: CARD,
  },
  headerTitle: {
    color: TEXT, fontSize: 17, fontWeight: '700',
  },

  heroSection: {
    alignItems: 'center', paddingTop: 32, paddingBottom: 24, paddingHorizontal: 20,
  },
  avatarRing: {
    width: 96, height: 96, borderRadius: 48,
    borderWidth: 3, borderColor: ORANGE,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitial: { color: '#fff', fontSize: 34, fontWeight: '900' },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute', right: -2, bottom: -2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: ORANGE,
    borderWidth: 2, borderColor: CARD,
    alignItems: 'center', justifyContent: 'center',
  },
  heroName:      { color: TEXT,  fontSize: 20, fontWeight: '800', marginBottom: 4 },
  heroEmail:     { color: TEXT2, fontSize: 13, marginBottom: 12 },
  roleBadge: {
    backgroundColor: ORANGE_TINT, borderRadius: 10,
    borderWidth: 1, borderColor: ORANGE_BORDER,
    paddingHorizontal: 14, paddingVertical: 5,
  },
  roleBadgeText: { color: ORANGE, fontSize: 12, fontWeight: '700' },

  statsRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 20,
    backgroundColor: CARD, borderRadius: 18,
    borderWidth: 1, borderColor: BORDER, overflow: 'hidden',
  },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 18 },
  statValue: { color: TEXT,  fontSize: 18, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: MUTED, fontSize: 11, fontWeight: '500' },

  section: {
    marginHorizontal: 20, marginBottom: 16,
    backgroundColor: CARD, borderRadius: 20,
    borderWidth: 1, borderColor: BORDER, padding: 18,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: { color: TEXT, fontSize: 15, fontWeight: '700' },
  editBtn: {
    paddingHorizontal: 14, paddingVertical: 6,
    backgroundColor: ORANGE_TINT_MUTED, borderRadius: 10,
    borderWidth: 1, borderColor: ORANGE_BORDER_MEDIUM,
  },
  editBtnText: { color: ORANGE, fontSize: 12, fontWeight: '700' },

  upgradeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 13,
  },
  historyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER,
    borderRadius: 14, paddingVertical: 13,
  },

  fieldRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: BORDER,
  },
  fieldIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: TEXT_TINT_SOFT,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  fieldLabel: { color: MUTED, fontSize: 11, fontWeight: '500', marginBottom: 2 },
  fieldValue: { color: TEXT,  fontSize: 14, fontWeight: '500' },

  inputLabel: { color: TEXT2, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: SURFACE, borderRadius: 12,
    borderWidth: 1, borderColor: BORDER,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  input: { flex: 1, color: TEXT, fontSize: 14, fontWeight: '500', padding: 0 },

  genderBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, borderColor: BORDER,
    backgroundColor: SURFACE,
  },
  genderBtnActive: {
    borderColor: ORANGE_BORDER_FOCUS,
    backgroundColor: ORANGE_TINT_SOFT,
  },

  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: ORANGE, borderRadius: 14,
    paddingVertical: 14, marginTop: 4,
  },

  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)',
    borderRadius: 16, paddingVertical: 14,
    backgroundColor: 'rgba(239,68,68,0.06)',
  },
});
