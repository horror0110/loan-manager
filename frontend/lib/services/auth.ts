import axios from "axios";

// TypeScript types
interface LoginSuccessResponse {
  success: true;
  token: string;
  user?: any;
  message: string;
}

interface LoginErrorResponse {
  success: false;
  message: string;
}

type LoginResponse = LoginSuccessResponse | LoginErrorResponse;

// ✅ auth.ts - Updated to handle response.data.message
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/login`,
      {
        email,
        password,
      }
    );

    return {
      success: true,
      token: response.data.token,
      user: response.data.user,
      message: response.data.message || "Системд амжилттай нэвтэрлээ",
    };
  } catch (error: any) {
    // Backend-аас ирсэн бүх боломжит message-үүдийг шалгана
    const errorMessage = 
      error.response?.data?.message ||  // Эхний давуу эрэмбэ
      error.response?.data?.detail ||   // Хоёрдогч сонголт
      error.response?.data?.error ||    // Гуравдагч сонголт
      error.message ||                  // Axios алдаа
      "Системд алдаа гарлаа";           // Default

    return {
      success: false,
      message: errorMessage,
    };
  }
};