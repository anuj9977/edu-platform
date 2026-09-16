import { useState } from 'react';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import {
  Alert,
  ApiError,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  PageLoader,
} from './ui';

export default function EntityPage({
  title,
  subtitle,
  actionLabel = '+ Add',
  fetchPath,
  dataKey,
  columns = [],
  emptyIcon = '📦',
  emptyTitle = 'Nothing here yet',
  emptyMessage = '',
  formFields = [],
  initialForm = {},
  transformCreate = (f) => f,
  transformEdit = (f) => f,
  editable = true,
  deletable = true,
  rowKey = '_id',
  entityLabel = 'record',
  createMessage = 'Created successfully',
  editMessage = 'Updated successfully',
  deleteMessage = 'Deleted successfully',
  canDelete = () => true,
  deleteConfirmText = (row) => 'Are you sure you want to delete this record?',
  modalSize = 'lg',
  extraHeader,
  filter,
}) {
  const { data, loading, error, refresh } = useFetch(fetchPath);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [error2, setError2] = useState(null);
  const [success, setSuccess] = useState(null);

  const setValue = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const openCreate = () => {
    setForm({ ...initialForm });
    setError2(null);
    setShowCreate(true);
  };

  const openEdit = (row) => {
    const next = {};
    formFields.forEach((f) => {
      const val = row[f.name];
      next[f.name] =
        val && f.type === 'date' && val.slice ? val.slice(0, 10) : val ?? initialForm[f.name] ?? '';
    });
    setForm(next);
    setError2(null);
    setEditing(row);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      await api.post(fetchPath, transformCreate(form));
      setSuccess(typeof createMessage === 'function' ? createMessage(form) : createMessage);
      setShowCreate(false);
      refresh();
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      await api.put(`${fetchPath}/${editing[rowKey]}`, transformEdit(form, editing));
      setSuccess(typeof editMessage === 'function' ? editMessage(form) : editMessage);
      setEditing(null);
      refresh();
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await api.delete(`${fetchPath}/${deleting[rowKey]}`);
      setSuccess(typeof deleteMessage === 'function' ? deleteMessage(deleting) : deleteMessage);
      setDeleting(null);
      refresh();
    } catch (err) {
      setError2(err);
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageLoader />;

  const rows = (data?.[dataKey] || []).filter((r) => (filter ? filter(r, data) : true));

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle ? subtitle(rows, data) : ''}
        actions={
          <>
            {extraHeader}
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              {actionLabel}
            </button>
          </>
        }
      />

      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}
      <ApiError error={error || error2} onClose={() => setError2(null)} />

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} style={c.align === 'right' ? { textAlign: 'right' } : undefined}>
                    {c.label}
                  </th>
                ))}
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1}>
                    <EmptyState
                      icon={emptyIcon}
                      title={emptyTitle}
                      message={emptyMessage}
                      action={
                        <button type="button" className="btn btn-primary" onClick={openCreate}>
                          {actionLabel}
                        </button>
                      }
                    />
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row[rowKey]}>
                  {columns.map((c) => (
                    <td key={c.key} style={c.align === 'right' ? { textAlign: 'right' } : undefined}>
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                  <td>
                    <div className="cell-actions" style={{ justifyContent: 'flex-end' }}>
                      {editable && (
                        <button type="button" className="btn btn-sm" onClick={() => openEdit(row)}>
                          Edit
                        </button>
                      )}
                      {deletable && canDelete(row) && (
                        <button type="button" className="btn btn-sm btn-danger-ghost" onClick={() => setDeleting(row)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add" size={modalSize}>
        <form onSubmit={handleCreate}>
          <div className="form-grid">{renderFields(formFields, form, setValue)}</div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title="Edit" size={modalSize}>
        <form onSubmit={handleEdit}>
          <div className="form-grid">{renderFields(formFields, form, setValue)}</div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Confirm delete"
        footer={
          <>
            <button type="button" className="btn" onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={busy}>
              {busy ? 'Deleting…' : 'Delete'}
            </button>
          </>
        }
      >
        <p>{deleting ? deleteConfirmText(deleting) : ''}</p>
      </Modal>
    </div>
  );
}

function renderFields(fields, form, setValue) {
  return fields.map((f) => (
    <Field key={f.name} label={f.label} required={f.required} span2={f.span2}>
      {f.type === 'textarea' ? (
        <textarea
          className="textarea"
          value={form[f.name] || ''}
          onChange={setValue(f.name)}
          placeholder={f.placeholder}
          required={f.required}
        />
      ) : f.type === 'select' ? (
        <select className="select" value={form[f.name] || ''} onChange={setValue(f.name)} required={f.required}>
          <option value="">{f.placeholder || '— Select —'}</option>
          {f.options?.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={f.type || 'text'}
          className="input"
          value={form[f.name] || ''}
          onChange={setValue(f.name)}
          placeholder={f.placeholder}
          required={f.required}
          minLength={f.minLength}
        />
      )}
    </Field>
  ));
}