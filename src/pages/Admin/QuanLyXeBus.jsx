import React, { useState, useEffect, useMemo } from "react";
import { FaPlus, FaSearch, FaSpinner, FaEdit, FaTrash } from "react-icons/fa";
import xeBuytService from "../../services/xeBuytService";
import BusModal from "../../components/BusModal";

function QuanLyXeBus() {
  const [buses, setBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [modalTitle, setModalTitle] = useState("Thêm xe buýt mới");

  // Fetch danh sách xe buýt
  const fetchBuses = async () => {
    setLoading(true);
    try {
      const res = await xeBuytService.getAll();
      if (res?.success) setBuses(res.data || []);
      else alert(res?.message || "Không thể lấy danh sách xe buýt");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi tải danh sách xe buýt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const filteredBuses = useMemo(
    () =>
      buses.filter((b) =>
        (b.bien_so_xe || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [buses, searchTerm]
  );

  const handleOpenCreate = () => {
    setEditingBus(null);
    setModalTitle("Thêm xe buýt mới");
    setIsModalOpen(true);
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setModalTitle("Sửa thông tin xe buýt");
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    try {
      if (editingBus) {
        const res = await xeBuytService.update(editingBus.id_xe_buyt, formData);
        if (res?.success) {
          setBuses((prev) =>
            prev.map((b) => (b.id_xe_buyt === editingBus.id_xe_buyt ? res.data : b))
          );
          setIsModalOpen(false);
        } else {
          alert(res?.message || "Cập nhật thất bại");
        }
      } else {
        const res = await xeBuytService.create(formData);
        if (res?.success) {
          setBuses((prev) => [res.data, ...prev]);
          setIsModalOpen(false);
        } else {
          alert(res?.message || "Thêm xe buýt thất bại");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu xe buýt");
    }
  };

  const handleDelete = async (bus) => {
    if (!window.confirm("Bạn có chắc muốn xóa xe buýt này?")) return;
    try {
      const res = await xeBuytService.delete(bus.id_xe_buyt);
      if (res?.success) {
        setBuses((prev) => prev.filter((b) => b.id_xe_buyt !== bus.id_xe_buyt));
      } else {
        alert(res?.message || "Xóa thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi xóa xe buýt");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
      {/* Modal */}
      <BusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingBus={editingBus}
        currentTitle={modalTitle}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý xe buýt</h1>
          <p className="text-gray-500 mt-1">Quản lý thông tin và số lượng ghế xe buýt</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-sm transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <FaPlus className="text-sm" />
          <span>Thêm xe buýt</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm theo biển số xe..."
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Hiển thị {filteredBuses.length} kết quả</span>
        </div>
      </div>

      {/* Danh sách xe buýt */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl mb-3" />
          <p className="text-gray-500 font-medium">Đang tải danh sách xe buýt...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border border-gray-100">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Biển số xe
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mẫu xe
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Số ghế
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredBuses.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    Không tìm thấy xe buýt
                  </td>
                </tr>
              ) : (
                filteredBuses.map((bus) => (
                  <tr key={bus.id_xe_buyt}>
                    <td className="px-6 py-4">{bus.bien_so_xe}</td>
                    <td className="px-6 py-4">{bus.hang}</td>
                    <td className="px-6 py-4">{bus.so_ghe}</td>
                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      <button
                        onClick={() => handleEdit(bus)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(bus)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default QuanLyXeBus;
