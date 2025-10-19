import React, { useState } from 'react';
// Đảm bảo đường dẫn đến authService là chính xác
import { login } from '../../services/authService'; 
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaExclamationCircle } from 'react-icons/fa';

// Component SVG cho hình ảnh minh họa
const BusIllustration = () => (
  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full object-cover">
    {/* Thân xe */}
    <rect x="20" y="80" width="160" height="60" rx="10" fill="#FFD700"/>
    <rect x="25" y="70" width="150" height="20" rx="5" fill="#F0C400"/>
    
    {/* Cửa sổ */}
    <rect x="35" y="85" width="30" height="25" rx="3" fill="#87CEEB"/>
    <rect x="75" y="85" width="30" height="25" rx="3" fill="#87CEEB"/>
    <rect x="115" y="85" width="30" height="25" rx="3" fill="#87CEEB"/>
    <rect x="155" y="85" width="20" height="25" rx="3" fill="#87CEEB"/>

    {/* Bánh xe */}
    <circle cx="50" cy="140" r="18" fill="#333"/>
    <circle cx="50" cy="140" r="8" fill="#DDD"/>
    <circle cx="150" cy="140" r="18" fill="#333"/>
    <circle cx="150" cy="140" r="8" fill="#DDD"/>
    
    {/* Đèn */}
    <circle cx="175" cy="125" r="5" fill="#FF6347"/>
    <circle cx="25" cy="125" r="5" fill="#FFFACD"/>

    {/* Vạch đen */}
    <rect x="20" y="115" width="160" height="5" fill="#333"/>
  </svg>
);


function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Giả lập độ trễ mạng để thấy hiệu ứng loading
      await new Promise(res => setTimeout(res, 1000));
      const userData = await login(username, password);
      onLoginSuccess(userData);
      
      // Chuyển hướng dựa trên vai trò
      switch (userData.vai_tro) {
        case 'quan_ly': navigate('/'); break;
        case 'tai_xe': navigate('/'); break;
        case 'phu_huynh': navigate('/'); break;
        default: navigate('/');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Cột hình ảnh (ẩn trên mobile) */}
        <div className="hidden md:flex w-1/2 bg-indigo-500 items-center justify-center p-12">
           <div className="text-white text-center">
             <BusIllustration />
             <h1 className="text-3xl font-bold mt-4">Smart School Bus</h1>
             <p className="mt-2 text-indigo-200">Hệ thống theo dõi xe buýt thông minh</p>
           </div>
        </div>

        {/* Cột form đăng nhập */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Đăng nhập
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Chào mừng bạn trở lại!
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Input Tên tài khoản */}
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaUser className="h-5 w-5 text-gray-400" />
                </span>
                <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Tên tài khoản"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            
            {/* Input Mật khẩu */}
            <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaLock className="h-5 w-5 text-gray-400" />
                </span>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            
            {/* Thông báo lỗi */}
            {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg">
                    <FaExclamationCircle/>
                    <span>{error}</span>
                </div>
            )}
            
            <div className="flex items-center justify-between text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Quên mật khẩu?
                </a>
            </div>

            {/* Nút Đăng nhập */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang xử lý...
                    </>
                ) : 'Đăng nhập'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
