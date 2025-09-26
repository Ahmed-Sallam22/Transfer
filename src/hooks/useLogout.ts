import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../features/auth/hooks';
import { clearAuth } from '../features/auth/authSlice';
import { useLogoutMutation } from '../api/auth.api';
import { toast } from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import { transferApi } from '../api/transfer.api';
import { transferDetailsApi } from '../api/transferDetails.api';
import { pendingTransferApi } from '../api/pendingTransfer.api';
import { FundAdjustmentsApi } from '../api/fundAdjustments.api';
import { fundRequestApi } from '../api/fundRequests.api';
import { reportsApi } from '../api/reports.api';
import { attachmentsApi } from '../api/attachments.api';

export const useLogout = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logoutMutation] = useLogoutMutation();
  const tokens = useAppSelector(state => state.auth.tokens);

  const logout = async () => {
    try {
      // Try to call logout API with both tokens in body (and header via endpoint)
      if (tokens?.token && tokens?.refresh) {
        await logoutMutation({ access: tokens.token, refresh: tokens.refresh }).unwrap();
      }
    } catch (error) {
      // If API call fails, still proceed with local logout
      console.warn('Logout API call failed, proceeding with local logout:', error);
    } finally {
      // Always clear local auth state
      dispatch(clearAuth());
      // Reset RTK Query caches to avoid stale data
      dispatch(authApi.util.resetApiState());
      dispatch(transferApi.util.resetApiState());
      dispatch(transferDetailsApi.util.resetApiState());
      dispatch(pendingTransferApi.util.resetApiState());
      dispatch(FundAdjustmentsApi.util.resetApiState());
      dispatch(fundRequestApi.util.resetApiState());
      dispatch(reportsApi.util.resetApiState());
      dispatch(attachmentsApi.util.resetApiState());
      toast.success('Logged out successfully');

      navigate('/auth/sign-in', { replace: true });
    }
  };

  return logout;
};
