import { useState } from 'react';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { Alert, ApiError, EmptyState, Field, Modal, PageHeader, PageLoader, statusBadge } from '../../components/ui';
import { classLabel, formatCurrency, formatDate } from '../../utils/format';

const emptyStruct = { classId: '', name: '', academicYear: '', amount: '', dueDate: '', description: '' };
const payMethods = ['cash', 'upi', 'card', 'bank_transfer', 'online'];

export default function Fees() {
  const { data: structures, loading: loadingStruct, refresh: refreshStruct } = useFetch('/api/fees/structures');
  const { data: classes } = useFetch('/api/classes');
  const { data: students, loading: loadingStudents } = useFetch('/api/students');

  const [showStruct, setShowStruct] = useState(false);
  const [structForm, setStructForm] = useState({ ...emptyStruct });
  const [invoiceForm, setInvoiceForm] = useState({ studentId: '', feeStructureId: '' });
  const [viewStudentId, setViewStudentId] = useState('');
  const [studentFees, setStudentFees] = useState(null);
  const [payTarget, setPayTarget] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', paymentMethod: 'cash', transactionId: '', remarks: '' });
  const [busy, setBusy] = useState(false);
  const [error2, setError2] = useState(null);
  const [success, setSuccess] = useState(null);

  const setStruct = (k) => (e) => setStructForm((f) => ({ ...f, [k]: e.target.value }));

  const createStruct = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      await api.post('/api/fees/structures', { ...structForm, amount: Number(structForm.amount), dueDate: structForm.dueDate || new Date() });
      setSuccess('Fee structure created');
      setShowStruct(false);
      setStructForm({ ...emptyStruct });
      refreshStruct();
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  const generateInvoice = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      await api.post('/api/fees/invoices', invoiceForm);
      setSuccess('Invoice generated for student');
      setInvoiceForm({ studentId: '', feeStructureId: '' });
      if (viewStudentId && viewStudentId === invoiceForm.studentId) fetchStudentFees(viewStudentId);
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  const fetchStudentFees = async (sid) => {
    setViewStudentId(sid);
    setBusy(true);
    setError2(null);
    try {
      const res = await api.get(`/api/fees/student/${sid}`);
      setStudentFees(res);
    } catch (err) {
      setError2(err);
      setStudentFees(null);
    } finally {
      setBusy(false);
    }
  };

  const recordPayment = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError2(null);
    try {
      await api.post(`/api/fees/invoices/${payTarget._id}/payments`, {
        amount: Number(payForm.amount),
        paymentMethod: payForm.paymentMethod,
        transactionId: payForm.transactionId,
        remarks: payForm.remarks,
      });
      setSuccess('Payment recorded');
      setPayTarget(null);
      setPayForm({ amount: '', paymentMethod: 'cash', transactionId: '', remarks: '' });
      if (viewStudentId) fetchStudentFees(viewStudentId);
    } catch (err) {
      setError2(err);
    } finally {
      setBusy(false);
    }
  };

  if (loadingStruct || loadingStudents) return <PageLoader />;

  const feeStructs = structures?.feeStructures || [];

  return (
    <div>
      <PageHeader
        title="Fees"
        subtitle={`${feeStructs.length} fee structures`}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setShowStruct(true)}>
            + Add Fee Structure
          </button>
        }
      />

      {success && <Alert type="success" onClose={() => setSuccess(null)}>{success}</Alert>}
      <ApiError error={error2} onClose={() => setError2(null)} />

      <div className="grid-2-1">
        <div className="card">
          <div className="card-header"><h3>Fee structures</h3></div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Year</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {feeStructs.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState icon="💰" title="No fee structures yet" message="Create fee structures per class." />
                    </td>
                  </tr>
                )}
                {feeStructs.map((f) => (
                  <tr key={f._id}>
                    <td style={{ fontWeight: 600 }}>{f.name}</td>
                    <td>{f.classId ? classLabel(f.classId) : '—'}</td>
                    <td>{f.academicYear}</td>
                    <td className="text-right">{formatCurrency(f.amount)}</td>
                    <td>{formatDate(f.dueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3>Generate invoice</h3></div>
          <div className="card-body">
            <form onSubmit={generateInvoice}>
              <Field label="Student" required>
                <select
                  className="select"
                  value={invoiceForm.studentId}
                  onChange={(e) => setInvoiceForm((f) => ({ ...f, studentId: e.target.value }))}
                  required
                >
                  <option value="">— Select student —</option>
                  {(students?.students || []).map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.userId?.name || s.name} · {s.admissionNumber}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Fee Structure" required>
                <select
                  className="select"
                  value={invoiceForm.feeStructureId}
                  onChange={(e) => setInvoiceForm((f) => ({ ...f, feeStructureId: e.target.value }))}
                  required
                >
                  <option value="">— Select structure —</option>
                  {feeStructs.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({formatCurrency(f.amount)})
                    </option>
                  ))}
                </select>
              </Field>
              <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
                {busy ? 'Generating…' : 'Generate Invoice'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <h3>Student fee ledger</h3>
          <select
            className="select"
            style={{ maxWidth: 320 }}
            value={viewStudentId}
            onChange={(e) => fetchStudentFees(e.target.value)}
          >
            <option value="">— View student fees —</option>
            {(students?.students || []).map((s) => (
              <option key={s._id} value={s._id}>
                {s.userId?.name || s.name} · {s.admissionNumber}
              </option>
            ))}
          </select>
        </div>
        {!studentFees && (
          <div className="card-body">
            <EmptyState
              icon="🧾"
              title="Select a student"
              message="Their invoices and payment history will appear here."
            />
          </div>
        )}
        {studentFees && (
          <div className="card-body">
            <div className="stats-grid" style={{ marginBottom: 16 }}>
              <div className="stat-card">
                <div className="stat-label">Total billed</div>
                <div className="stat-value" style={{ fontSize: 20 }}>
                  {formatCurrency(studentFees.summary.totalAmount)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Paid</div>
                <div className="stat-value" style={{ fontSize: 20, color: 'var(--green)' }}>
                  {formatCurrency(studentFees.summary.paidAmount)}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pending</div>
                <div className="stat-value" style={{ fontSize: 20, color: 'var(--red)' }}>
                  {formatCurrency(studentFees.summary.pendingAmount)}
                </div>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th style={{ textAlign: 'right' }}>Paid</th>
                    <th>Due</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studentFees.invoices.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState icon="🧾" title="No invoices" message="Generate an invoice for this student." />
                      </td>
                    </tr>
                  )}
                  {studentFees.invoices.map((inv) => (
                    <tr key={inv._id}>
                      <td>{inv.feeStructureId?.name || '—'}</td>
                      <td className="text-right">{formatCurrency(inv.totalAmount)}</td>
                      <td className="text-right">{formatCurrency(inv.paidAmount)}</td>
                      <td>{formatDate(inv.dueDate)}</td>
                      <td>{statusBadge(inv.status)}</td>
                      <td>
                        <div className="cell-actions" style={{ justifyContent: 'flex-end' }}>
                          <button type="button" className="btn btn-sm" onClick={() => setPayTarget(inv)}>
                            Record Payment
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal open={showStruct} onClose={() => setShowStruct(false)} title="Add Fee Structure" size="lg">
        <form onSubmit={createStruct}>
          <div className="form-grid">
            <Field label="Name" required>
              <input className="input" value={structForm.name} onChange={setStruct('name')} required placeholder="e.g. Tuition Fee" />
            </Field>
            <Field label="Class" required>
              <select className="select" value={structForm.classId} onChange={setStruct('classId')} required>
                <option value="">— Select class —</option>
                {classes?.classes?.map((c) => (
                  <option key={c._id} value={c._id}>{classLabel(c)}</option>
                ))}
              </select>
            </Field>
            <Field label="Academic Year" required>
              <input className="input" value={structForm.academicYear} onChange={setStruct('academicYear')} required placeholder="e.g. 2025-26" />
            </Field>
            <Field label="Amount" required>
              <input type="number" min="0" className="input" value={structForm.amount} onChange={setStruct('amount')} required />
            </Field>
            <Field label="Due Date" required>
              <input type="date" className="input" value={structForm.dueDate} onChange={setStruct('dueDate')} required />
            </Field>
            <Field label="Description">
              <input className="input" value={structForm.description} onChange={setStruct('description')} />
            </Field>
          </div>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowStruct(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Creating…' : 'Create Fee Structure'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(payTarget)} onClose={() => setPayTarget(null)} title="Record Payment">
        <form onSubmit={recordPayment}>
          <p className="text-muted mt-0">
            Invoice: <strong>{payTarget?.feeStructureId?.name}</strong> • Remaining:{' '}
            <strong>{formatCurrency((payTarget?.totalAmount || 0) - (payTarget?.paidAmount || 0))}</strong>
          </p>
          <Field label="Amount" required>
            <input
              type="number"
              min="1"
              max={(payTarget?.totalAmount || 0) - (payTarget?.paidAmount || 0)}
              className="input"
              value={payForm.amount}
              onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
              required
            />
          </Field>
          <Field label="Payment Method" required>
            <select
              className="select"
              value={payForm.paymentMethod}
              onChange={(e) => setPayForm((f) => ({ ...f, paymentMethod: e.target.value }))}
            >
              {payMethods.map((m) => (
                <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </Field>
          <Field label="Transaction ID">
            <input
              className="input"
              value={payForm.transactionId}
              onChange={(e) => setPayForm((f) => ({ ...f, transactionId: e.target.value }))}
            />
          </Field>
          <Field label="Remarks">
            <input
              className="input"
              value={payForm.remarks}
              onChange={(e) => setPayForm((f) => ({ ...f, remarks: e.target.value }))}
            />
          </Field>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setPayTarget(null)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
