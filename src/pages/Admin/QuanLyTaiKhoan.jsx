import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaKey, FaSearch, FaFilter } from 'react-icons/fa';
import EditAccountModal from '../../components/EditAccountModal';
import ChangePasswordModal from '../../components/ChangePasswordModal';

// Dữ liệu mẫu (sẽ thay thế bằng API call sau)
const mockAccounts = [
  {
    id_nguoi_dung: 1,
    ho_ten: 'Nguyễn Văn Quản Lý',
    ten_tai_khoan: 'quanly01',
    so_dien_thoai: '0901234567',
    vai_tro: 'quan_ly',
    ngay_tao: '2024-01-15T10:30:00Z'
  },
  {
    id_nguoi_dung: 2,
    ho_ten: 'Trần Thị Phụ Huynh',
    ten_tai_khoan: 'phuhuynh01',
    so_dien_thoai: '0912345678',
    vai_tro: 'phu_huynh',
    ngay_tao: '2024-01-16T14:20:00Z'
  },
  {
    id_nguoi_dung: 3,
    ho_ten: 'Lê Văn Tài Xế',
    ten_tai_khoan: 'taixe01',
    so_dien_thoai: '0923456789',
    vai_tro: 'tai_xe',
    ngay_tao: '2024-01-17T09:15:00Z'
  }
];

const roleLabels = {
  quan_ly: 'Quản lý',
  phu_huynh: 'Phụ huynh',
  tai_xe: 'Tài xế'
};

const roleColors = {
  quan_ly: 'bg-blue-100 text-blue-800',
  phu_huynh: 'bg-green-100 text-green-800',
  tai_xe: 'bg-orange-100 text-orange-800'
};

function QuanLyTaiKhoan() {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [changingPasswordAccount, setChangingPasswordAccount] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    ho_ten: '',
    ten_tai_khoan: '',
    mat_khau: '',
    so_dien_thoai: '',
    vai_tro: 'phu_huynh'
  });

  const [passwordData, setPasswordData] = useState({
    mat_khau_cu: '',
    mat_khau_moi: '',
    xac_nhan_mat_khau: ''
  });

  // Load dữ liệu
  useEffect(() => {
    loadAccounts();
  }, []);

  // Filter dữ liệu
  useEffect(() => {
    filterAccounts();
  }, [accounts, searchTerm, roleFilter]);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      // TODO: Thay thế bằng API call
      // const response = await apiClient.get('/nguoi-dung');
      // setAccounts(response.data);
      setTimeout(() => {
        setAccounts(mockAccounts);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Lỗi khi tải danh sách tài khoản:', error);
      setLoading(false);
    }
  };

  const filterAccounts = () => {
    let filtered = accounts;

    if (searchTerm) {
      filtered = filtered.filter(account =>
        account.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.ten_tai_khoan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.so_dien_thoai.includes(searchTerm)
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(account => account.vai_tro === roleFilter);
    }

    setFilteredAccounts(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      ho_ten: '',
      ten_tai_khoan: '',
      mat_khau: '',
      so_dien_thoai: '',
      vai_tro: 'phu_huynh'
    });
  };

  const resetPasswordForm = () => {
    setPasswordData({
      mat_khau_cu: '',
      mat_khau_moi: '',
      xac_nhan_mat_khau: ''
    });
  };

  const openAddModal = () => {
    setEditingAccount(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (account) => {
    setEditingAccount(account);
    setFormData({
      ho_ten: account.ho_ten,
      ten_tai_khoan: account.ten_tai_khoan,
      mat_khau: '', // Không hiển thị mật khẩu cũ
      so_dien_thoai: account.so_dien_thoai || '',
      vai_tro: account.vai_tro
    });
    setShowModal(true);
  };

  const openPasswordModal = (account) => {
    setChangingPasswordAccount(account);
    resetPasswordForm();
    setShowPasswordModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.ho_ten || !formData.ten_tai_khoan || (!editingAccount && !formData.mat_khau)) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!editingAccount && formData.mat_khau.length < 6) {
      alert('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      if (editingAccount) {
        // TODO: API call để cập nhật
        // await apiClient.put(`/nguoi-dung/${editingAccount.id_nguoi_dung}`, formData);
        const updatedAccounts = accounts.map(account =>
          account.id_nguoi_dung === editingAccount.id_nguoi_dung
            ? { ...account, ...formData }
            : account
        );
        setAccounts(updatedAccounts);
        alert('Cập nhật tài khoản thành công!');
      } else {
        // TODO: API call để tạo mới
        // const response = await apiClient.post('/nguoi-dung', formData);
        const newAccount = {
          ...formData,
          id_nguoi_dung: Math.max(...accounts.map(a => a.id_nguoi_dung)) + 1,
          ngay_tao: new Date().toISOString()
        };
        setAccounts([...accounts, newAccount]);
        alert('Tạo tài khoản thành công!');
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Lỗi khi lưu tài khoản:', error);
      alert('Có lỗi xảy ra khi lưu tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.mat_khau_cu || !passwordData.mat_khau_moi || !passwordData.xac_nhan_mat_khau) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordData.mat_khau_moi !== passwordData.xac_nhan_mat_khau) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    if (passwordData.mat_khau_moi.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      // TODO: API call để đổi mật khẩu
      // await apiClient.put(`/nguoi-dung/${changingPasswordAccount.id_nguoi_dung}/doi-mat-khau`, {
      //   mat_khau_cu: passwordData.mat_khau_cu,
      //   mat_khau_moi: passwordData.mat_khau_moi
      // });

      alert('Đổi mật khẩu thành công!');
      setShowPasswordModal(false);
      resetPasswordForm();
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      alert('Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${account.ten_tai_khoan}"?`)) {
      return;
    }

    setLoading(true);
    try {
      // TODO: API call để xóa
      // await apiClient.delete(`/nguoi-dung/${account.id_nguoi_dung}`);
      const updatedAccounts = accounts.filter(a => a.id_nguoi_dung !== account.id_nguoi_dung);
      setAccounts(updatedAccounts);
      alert('Xóa tài khoản thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa tài khoản:', error);
      alert('Có lỗi xảy ra khi xóa tài khoản');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="h-full max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
            <p className="text-blue-100 mt-1">Quản lý người dùng hệ thống</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <FaPlus size={16} />
            Thêm tài khoản
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo họ tên, tên tài khoản hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả vai trò</option>
              <option value="quan_ly">Quản lý</option>
              <option value="phu_huynh">Phụ huynh</option>
              <option value="tai_xe">Tài xế</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ tên</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên tài khoản</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số điện thoại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id_nguoi_dung} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {account.id_nguoi_dung}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.ho_ten}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.ten_tai_khoan}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {account.so_dien_thoai || 'Chưa cập nhật'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${roleColors[account.vai_tro]}`}>
                        {roleLabels[account.vai_tro]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(account.ngay_tao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(account)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Sửa"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => openPasswordModal(account)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Đổi mật khẩu"
                        >
                          <FaKey size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(account)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Xóa"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredAccounts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Không tìm thấy tài khoản nào</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal thêm/sửa tài khoản */}
      <EditAccountModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        editingAccount={editingAccount}
        formData={formData}
        onInputChange={handleInputChange}
        loading={loading}
      />

      {/* Modal đổi mật khẩu */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
        account={changingPasswordAccount}
        passwordData={passwordData}
        onInputChange={handlePasswordChange}
        loading={loading}
      />
    </div>
  );
}

export default QuanLyTaiKhoan;