import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {  useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useLoginMutation } from '../../api/auth.api';
import { useAppDispatch } from '../../features/auth/hooks';
import { setCredentials } from '../../features/auth/authSlice';
import { Button, Input, PasswordInput, Checkbox, FormField } from '../../components/ui';
import Animation from '../../assets/Animation.png';
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function SignIn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await login({
        username: data.username,
        password: data.password,
      }).unwrap();
dispatch(setCredentials(result));
toast.success(result.message || 'Sign in successful!');

const storedRedirect = sessionStorage.getItem('postLoginRedirect');
const fromState = location.state?.from?.pathname;
const target = storedRedirect || fromState || '/app';

sessionStorage.removeItem('postLoginRedirect');
navigate(target, { replace: true });
    } catch (error) {
      // Error is already handled by RTK Query and shown via toast
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex lg:flex-row flex-col">

<div className="h-[20vh] flex lg:hidden items-center justify-center bg-gradient-to-r from-[#0773FF] to-[#00377E]">
    <svg width="100" height="49" viewBox="0 0 100 49" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M92.8933 2.72147C88.8666 4.63151 83.4921 5.77586 79.3298 6.42376H4.05211L0 14.7286C19.4976 18.9358 39.7073 27.7119 51.1939 49C47.8623 37.119 34.214 19.8866 24.3635 14.9053L83.7973 17.1351L93.9699 6.42376C98.3442 1.84639 105.524 -3.26949 92.8933 2.72147Z" fill="white"/>
</svg>
        </div>
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 rounded-t-3xl">
        <div className="max-w-md w-full space-y-8">
          <div className='text-center lg:text-start'>
            <h2 className="mt-6  text-2xl lg:text-3xl font-extrabold text-[gray-900]">
              {t('signIn')}
            </h2>
            <p className="mt-2  text-sm text-[#757575]">
              {t('signInSubtitle') || 'Enter your account details or use SSO Login'}
            </p>
          </div>
          
          <form className="mt-8 space-y-6 " onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <FormField>
                <Input
                  label={t('username') || 'Username'}
                  type="text"
                  autoComplete="username"
                  placeholder="Enter your username"
                  error={errors.username?.message}
                  {...register('username')}
                />
              </FormField>

              <FormField>
                <PasswordInput
                  label={t('password')}
                  autoComplete="current-password"
                  placeholder='Enter your password'
                  error={errors.password?.message}
                  {...register('password')}
                />
              </FormField>

              <div className="flex  items-center flex-wrap gap-5 justify-between">
                <Checkbox
                  label={t('rememberMe')}
                  {...register('rememberMe')}
                />
                {/* <Link
                  to="/auth/reset"
                  className='text-sm text-[#282828] font-semibold hover:text-blue-500'
                >
                  {t('forgotPassword')}
                </Link> */}
              </div>
            </div>

            <div className="lg:space-y-4 lg:py-6">
              <Button
                type="submit"
                className="w-full cursor-pointer"
                loading={isLoading}
              >
                {t('signIn')}
              </Button>
{/*               
<DividerWithText>{t('or') || 'or'}</DividerWithText>

              <Button
                type="button"
                variant="secondary"
                className="w-full cursor-pointer"
                icon={<MicrosoftIcon />}
              >
                {t('signInWithMicrosoft')}
              </Button> */}
            </div>

            {/* <div className="text-start pb-4 ">
              <p className="text-sm text-[#282828]">
                {t('noAccount') || "Don't have an account?"}{' '}
                <Link
                  to="/auth/sign-up"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  {t('createAccount')}
                </Link>
              </p>
            </div> */}
          </form>
        </div>

       
      </div>
    

      {/* Right Panel - Hero */}
      <div className="hidden   lg:block lg:w-1/2 bg-gradient-to-br from-[#00B7AD] to-[#005B5D] relative">
        <img src={Animation} className='w-full h-screen object-center' alt="" />
      </div>
    </div>
  );
}
