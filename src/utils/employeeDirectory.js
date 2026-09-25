export function filterEmployees(employees, { search = '', status = 'all', designation = '', sort = 'newest' }) {
  const query = search.trim().toLowerCase();
  return employees.filter(employee => {
    const matchesSearch = !query || [employee.name, employee.email, employee.empId, employee.designation, employee.phoneNumber]
      .some(value => String(value || '').toLowerCase().includes(query));
    const matchesStatus = status === 'all' || (employee.onboardingStatus === 'Completed') === (status === 'completed');
    return matchesSearch && matchesStatus && (!designation || (employee.designation || 'Unassigned') === designation);
  }).sort((a, b) => {
    if (sort === 'name') return String(a.name || '').localeCompare(String(b.name || ''));
    if (sort === 'salary') return (Number(b.salary) || 0) - (Number(a.salary) || 0);
    return (Date.parse(b.dateOfJoining) || 0) - (Date.parse(a.dateOfJoining) || 0);
  });
}
