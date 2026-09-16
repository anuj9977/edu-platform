import EntityPage from '../../components/EntityPage';
import { NameCell, statusBadge } from '../../components/ui';
import { formatDate, titleCase } from '../../utils/format';

const initialForm = {
  name: '',
  email: '',
  password: '',
  employeeId: '',
  qualification: '',
  specialization: '',
  joiningDate: '',
  phone: '',
};

export default function Teachers() {
  return (
    <EntityPage
      title="Teachers"
      actionLabel="+ Add Teacher"
      fetchPath="/api/teachers"
      dataKey="teachers"
      subtitle={(rows) => `${rows.length} staff records`}
      emptyIcon="👩‍🏫"
      emptyTitle="No teachers yet"
      emptyMessage="Add teachers to assign them subjects and classes."
      initialForm={initialForm}
      createMessage={(f) => `Teacher “${f.name}” created successfully`}
      editMessage="Teacher updated successfully"
      deleteMessage="Teacher deactivated"
      deleteConfirmText={(row) =>
        `Deactivate ${row.userId?.name || row.name}? Their login will be disabled.`
      }
      columns={[
        {
          key: 'name',
          label: 'Teacher',
          render: (t) => <NameCell name={t.userId?.name || t.name || '—'} sub={t.userId?.email} />,
        },
        { key: 'employeeId', label: 'Employee ID', render: (t) => t.employeeId || '—' },
        {
          key: 'specialization',
          label: 'Specialization',
          render: (t) => titleCase(t.specialization) || '—',
        },
        {
          key: 'qualification',
          label: 'Qualification',
          render: (t) => titleCase(t.qualification) || '—',
        },
        { key: 'phone', label: 'Phone', render: (t) => t.userId?.phone || t.phone || '—' },
        { key: 'joiningDate', label: 'Joined', render: (t) => formatDate(t.joiningDate) },
        { key: 'status', label: 'Status', render: (t) => statusBadge(t.status) },
      ]}
      formFields={[
        { name: 'name', label: 'Full Name', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'password', label: 'Password', type: 'password', required: true, minLength: 6 },
        { name: 'employeeId', label: 'Employee ID', required: true },
        { name: 'qualification', label: 'Qualification', placeholder: 'e.g. M.Sc, B.Ed' },
        { name: 'specialization', label: 'Specialization', placeholder: 'e.g. Mathematics' },
        { name: 'joiningDate', label: 'Joining Date', type: 'date' },
        { name: 'phone', label: 'Phone' },
      ]}
      transformEdit={(f) => ({
        qualification: f.qualification,
        specialization: f.specialization,
        joiningDate: f.joiningDate,
        phone: f.phone,
      })}
    />
  );
}