import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { getUsers, createUser, updateUser } from '../../api/userApi';
import { getRoles } from '../../api/roleApi';
import Layout from '../../components/layout';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import type { User, UserForm } from '../../models/User';
import type { CatalogItem } from '../../models/CatalogItem';
import logo from '../../assets/Logo.png';

import './users.css';

const initialFormState: UserForm = {
  name: '',
  email: '',
  password: '',
  id_role: 0,
};

type FormMode = 'create' | 'edit';

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserForm>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserForm, string>>>({});
  const itemsPerPage = 10;

  const loadUsers = async (signal?: AbortSignal) => {
    try {
      const response = await getUsers(signal);
      if (signal?.aborted) return;
      setUsers(Array.isArray(response) ? response : []);
    } catch (error) {
      if (signal?.aborted) return;
      console.error(error);
      toast.error('No se pudo cargar la lista de usuarios');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadRoles = async () => {
      try {
        const response = await getRoles(controller.signal);
        if (controller.signal.aborted) return;
        setRoles(response);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
      }
    };
    loadUsers(controller.signal);
    loadRoles();
    return () => {
      controller.abort();
    };
  }, []);

  const { currentPage, setCurrentPage, totalPages, paginatedItems } = usePagination(users, itemsPerPage);

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.trim().length < 10) return 'El nombre debe tener al menos 10 caracteres';
        if (value.length > 255) return 'El nombre no puede exceder 255 caracteres';
        return null;

      case 'email':
        if (!value.trim()) return 'El email es requerido';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
        return null;

      case 'password':
        if (formMode === 'create') {
          if (!value) return 'La contraseña es requerida';
          if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        } else if (value && value.length < 6) {
          return 'La contraseña debe tener al menos 6 caracteres';
        }
        return null;

      default:
        return null;
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof UserForm, string>> = {};
    let isValid = true;

    (['name', 'email', 'password'] as const).forEach(field => {
      const error = validateField(field, formData[field] || '');
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    if (!formData.id_role) {
      errors.id_role = 'Selecciona un rol';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData(current => ({
      ...current,
      [name]: name === 'id_role' ? Number(value) : value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setFormMode('create');
    setEditingId(null);
  };

  const openCreateForm = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEditForm = (user: User) => {
    setFormMode('edit');
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      id_role: user.id_role,
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setSaving(true);

      if (formMode === 'create') {
        await createUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          id_role: formData.id_role,
        });
        toast.success('Usuario creado correctamente');
      } else if (editingId !== null) {
        const updateData: Record<string, unknown> = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          id_role: formData.id_role,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateUser(editingId, updateData);
        toast.success('Usuario actualizado correctamente');
      }

      resetForm();
      setFormOpen(false);
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast.error(formMode === 'create' ? 'No se pudo crear el usuario' : 'No se pudo actualizar el usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await updateUser(user.id, { active: !user.active });
      toast.success(user.active ? 'Usuario desactivado' : 'Usuario activado');
      await loadUsers();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cambiar el estado del usuario');
    }
  };

  const getRoleName = (idRole: number) => {
    const role = roles.find(r => r.id === idRole);
    return role?.name ?? `Rol ${idRole}`;
  };

  return (
    <Layout>
      <div className="users-page">
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          className="users-page__background-logo"
        />

        <div className="users-page__header">
          <div>
            <p className="users-page__eyebrow">Administración</p>
            <h1>Gestión de usuarios</h1>
          </div>

          <button
            type="button"
            className="users-page__new-btn"
            onClick={openCreateForm}
          >
            + Nuevo usuario
          </button>
        </div>

        {formOpen && (
          <section className="users-form-card">
            <div className="users-form-card__header">
              <div>
                <h2>{formMode === 'create' ? 'Crear usuario' : 'Editar usuario'}</h2>
                <p>{formMode === 'create' ? 'Completa los datos para crear un nuevo usuario.' : 'Modifica los datos del usuario.'}</p>
              </div>
            </div>

            <form className="users-form" onSubmit={handleSubmit}>
              <label>
                <span>Nombre completo</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder=" "
                  minLength={10}
                  maxLength={255}
                  aria-invalid={!!formErrors.name}
                />
                {formErrors.name && (
                  <span className="users-form__error" role="alert">
                    {formErrors.name}
                  </span>
                )}
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder=" "
                  aria-invalid={!!formErrors.email}
                />
                {formErrors.email && (
                  <span className="users-form__error" role="alert">
                    {formErrors.email}
                  </span>
                )}
              </label>

              <label>
                <span>Contraseña{formMode === 'edit' ? ' (dejar vacío para no cambiar)' : ''}</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder=" "
                  minLength={6}
                  aria-invalid={!!formErrors.password}
                />
                {formErrors.password && (
                  <span className="users-form__error" role="alert">
                    {formErrors.password}
                  </span>
                )}
              </label>

              <label>
                <span>Rol</span>
                <select
                  name="id_role"
                  value={formData.id_role}
                  onChange={handleChange}
                  aria-invalid={!!formErrors.id_role}
                >
                  <option value={0}>Selecciona un rol</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {formErrors.id_role && (
                  <span className="users-form__error" role="alert">
                    {formErrors.id_role}
                  </span>
                )}
              </label>

              <div className="users-form__actions">
                <button
                  type="button"
                  className="users-form__secondary"
                  onClick={() => {
                    resetForm();
                    setFormOpen(false);
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="users-form__primary"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner spinner--small" /> Guardando...
                    </>
                  ) : (
                    <>
                      {formMode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="users-table-card">
          <div className="users-table-card__header">
            <h2>Usuarios registrados</h2>
          </div>

          {loading ? (
            <p className="users-table-card__state">Cargando...</p>
          ) : users.length === 0 ? (
            <p className="users-table-card__state">No hay usuarios registrados.</p>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role?.name ?? getRoleName(user.id_role)}</td>
                      <td>
                        <span className={`users-status ${user.active ? 'users-status--active' : 'users-status--inactive'}`}>
                          {user.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="users-table__actions">
                        <button
                          type="button"
                          className="users-table__btn users-table__btn--edit"
                          onClick={() => openEditForm(user)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={`users-table__btn ${user.active ? 'users-table__btn--deactivate' : 'users-table__btn--activate'}`}
                          onClick={() => handleToggleActive(user)}
                        >
                          {user.active ? 'Desactivar' : 'Activar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </section>
      </div>
    </Layout>
  );
}

export default UsersPage;