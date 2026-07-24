import { AlertTriangle } from "lucide-react-native";

import { ConfirmModal } from "@/components/confirm-modal";
import { RED } from "@/constants/palette";
import { useAuthStore } from "@/features/auth/store";

// Mounted 1 lần ở root layout (luôn tồn tại bất kể đang ở group (app) hay
// (auth)) — theo dõi logoutReason trong auth store để báo cho người dùng biết
// vì sao họ bị đưa về màn hình đăng nhập giữa chừng, thay vì bị đá ra một
// cách im lặng. Việc điều hướng về /login đã tự động xảy ra qua <Redirect/>
// trong (app)/_layout.tsx khi isAuthenticated chuyển false, nên ở đây chỉ
// cần hiển thị thông báo.
export function SessionExpiredModal() {
  const logoutReason = useAuthStore((s) => s.logoutReason);
  const clearLogoutReason = useAuthStore((s) => s.clearLogoutReason);

  return (
    <ConfirmModal
      visible={logoutReason === "expired"}
      variant="danger"
      icon={<AlertTriangle size={22} color={RED} />}
      title="Phiên đăng nhập đã hết hạn"
      message="Vì lý do bảo mật, bạn đã bị đăng xuất. Vui lòng đăng nhập lại để tiếp tục sử dụng HistoryTalk."
      confirmText="Đăng nhập lại"
      onConfirm={clearLogoutReason}
    />
  );
}
