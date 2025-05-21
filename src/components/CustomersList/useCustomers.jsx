// src/components/CustomersList/useCustomers.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../../services/projectService';
import { calculateTotal } from '../Calculator/calculations/costCalculations';
import { formatPhoneNumber, formatDate } from '../Calculator/utils/customerhelper';

const DUE_SOON_DAYS = 7;
const OVERDUE_THRESHOLD = -1;
const ITEMS_PER_PAGE = 10;

export const useCustomers = ({ viewMode = 'table' } = {}) => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const projectTotals = useCallback(
    (project) => {
      console.log('Project data for totals:', JSON.stringify(project, null, 2)); // Debug log
      const totals = calculateTotal(
        project.categories || [],
        project.settings?.taxRate || 0,
        project.settings?.transportationFee || 0,
        project.settings?.wasteFactor || 0,
        project.settings?.miscFees || [],
        project.settings?.markup || 0,
        project.settings?.laborDiscount || 0 // Pass laborDiscount
      );
      const grandTotal = totals.total || 0;
      const totalPaid = (project.settings?.payments || []).reduce(
        (sum, payment) => sum + (payment.isPaid ? payment.amount : 0),
        0
      ) + (project.settings?.deposit || 0);
      const amountRemaining = Math.max(0, grandTotal - totalPaid);
      console.log(
        `Project totals: grandTotal=${grandTotal}, totalPaid=${totalPaid}, amountRemaining=${amountRemaining}`
      ); // Debug log
      return { grandTotal, amountRemaining };
    },
    []
  );

  const determineStatus = useCallback(
    (projects) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let earliestStart = null;
      let latestFinish = null;
      let totalAmountRemaining = 0;

      projects.forEach((project) => {
        const startDate = project.customerInfo?.startDate
          ? new Date(project.customerInfo.startDate)
          : null;
        const finishDate = project.customerInfo?.finishDate
          ? new Date(project.customerInfo.finishDate)
          : null;
        const { amountRemaining } = projectTotals(project);
        if (startDate)
          earliestStart = earliestStart
            ? new Date(Math.min(earliestStart, startDate))
            : startDate;
        if (finishDate)
          latestFinish = latestFinish
            ? new Date(Math.max(latestFinish, finishDate))
            : finishDate;
        totalAmountRemaining += amountRemaining;
      });

      if (!earliestStart && !latestFinish) return 'Not Started';
      const daysToStart = earliestStart
        ? (earliestStart - today) / (1000 * 60 * 60 * 24)
        : Infinity;
      const daysToFinish = latestFinish
        ? (latestFinish - today) / (1000 * 60 * 60 * 24)
        : Infinity;

      if (daysToStart > DUE_SOON_DAYS) return 'Not Started';
      if (daysToStart <= DUE_SOON_DAYS && daysToStart > 0) return 'Starting Soon';
      if (daysToStart <= 0 && (daysToFinish > DUE_SOON_DAYS || !latestFinish))
        return 'In Progress';
      if (daysToFinish <= DUE_SOON_DAYS && daysToFinish > OVERDUE_THRESHOLD)
        return 'Due Soon';
      if (daysToFinish <= OVERDUE_THRESHOLD && totalAmountRemaining > 0)
        return 'Overdue';
      if (daysToFinish <= OVERDUE_THRESHOLD && totalAmountRemaining === 0)
        return 'Completed';
      return 'In Progress';
    },
    [projectTotals]
  );

  const groupAndSetCustomers = useCallback(
    (projectsList) => {
      const customerMap = projectsList.reduce((acc, project) => {
        const key = `${project.customerInfo?.firstName || ''}|${project.customerInfo?.lastName || ''}|${project.customerInfo?.phone || ''}`;
        if (!acc[key]) {
          acc[key] = {
            customerInfo: { ...project.customerInfo, projectName: null },
            projects: [],
            totalGrandTotal: 0,
            totalAmountRemaining: 0,
            earliestStartDate: null,
            latestFinishDate: null,
          };
        }
        acc[key].projects.push(project);
        const { grandTotal, amountRemaining } = projectTotals(project);
        acc[key].totalGrandTotal += grandTotal;
        acc[key].totalAmountRemaining += amountRemaining;

        const startDate = project.customerInfo?.startDate
          ? new Date(project.customerInfo.startDate)
          : null;
        const finishDate = project.customerInfo?.finishDate
          ? new Date(project.customerInfo.finishDate)
          : null;
        if (startDate)
          acc[key].earliestStartDate = acc[key].earliestStartDate
            ? new Date(Math.min(acc[key].earliestStartDate, startDate))
            : startDate;
        if (finishDate)
          acc[key].latestFinishDate = acc[key].latestFinishDate
            ? new Date(Math.max(acc[key].latestFinishDate, finishDate))
            : finishDate;

        acc[key].status = determineStatus(acc[key].projects);
        return acc;
      }, {});

      let customers = Object.values(customerMap);
      if (debouncedSearchQuery) {
        const queryLower = debouncedSearchQuery.toLowerCase().trim();
        const queryDigits = debouncedSearchQuery.replace(/\D/g, '');
        customers = customers.filter(
          (c) =>
            c.customerInfo.firstName?.toLowerCase().includes(queryLower) ||
            c.customerInfo.lastName?.toLowerCase().includes(queryLower) ||
            (queryDigits &&
              c.customerInfo.phone?.replace(/\D/g, '').includes(queryDigits)) ||
            c.status.toLowerCase().includes(queryLower)
        );
      }
      if (statusFilter) {
        customers = customers.filter((c) => c.status === statusFilter);
      }

      if (sortConfig.key) {
        customers.sort((a, b) => {
          const [aValue, bValue] =
            sortConfig.key === 'lastName'
              ? [
                  (a.customerInfo.lastName || '').toLowerCase(),
                  (b.customerInfo.lastName || '').toLowerCase(),
                ]
              : sortConfig.key === 'startDate'
              ? [
                  a.earliestStartDate?.getTime() || 0,
                  b.earliestStartDate?.getTime() || 0,
                ]
              : [a.totalAmountRemaining, b.totalAmountRemaining];
          return (aValue < bValue ? -1 : 1) * (sortConfig.direction === 'asc' ? 1 : -1);
        });
      }

      return customers;
    },
    [debouncedSearchQuery, sortConfig, projectTotals, determineStatus, statusFilter]
  );

  const refreshProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedProjects = await getProjects();
      console.log('Fetched projects:', JSON.stringify(fetchedProjects, null, 2)); // Debug log
      setProjects(fetchedProjects || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(`Failed to load customers: ${err.message}`);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const filteredCustomers = useMemo(
    () => groupAndSetCustomers(projects),
    [projects, groupAndSetCustomers]
  );
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);

  const totals = useMemo(
    () =>
      projects.reduce(
        (acc, project) => {
          const { grandTotal, amountRemaining } = projectTotals(project);
          acc.grandTotal += grandTotal;
          acc.amountRemaining += amountRemaining;
          return acc;
        },
        { grandTotal: 0, amountRemaining: 0 }
      ),
    [projects, projectTotals]
  );

  const notifications = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const AMOUNT_REMAINING_THRESHOLD = 5000;
    const notificationList = filteredCustomers.reduce((acc, customer) => {
      customer.projects.forEach((project) => {
        const startDate = project.customerInfo?.startDate
          ? new Date(project.customerInfo.startDate)
          : null;
        const finishDate = project.customerInfo?.finishDate
          ? new Date(project.customerInfo.finishDate)
          : null;
        if (startDate) {
          const daysToStart = (startDate - today) / (1000 * 60 * 60 * 24);
          if (daysToStart <= DUE_SOON_DAYS && daysToStart > 0) {
            acc.push({
              message: `${project.customerInfo.firstName} ${project.customerInfo.lastName}'s project starts soon on ${formatDate(startDate)}.`,
              overdue: false,
            });
          }
        }
        if (finishDate) {
          const daysToFinish = (finishDate - today) / (1000 * 60 * 60 * 24);
          if (daysToFinish <= DUE_SOON_DAYS && daysToFinish > OVERDUE_THRESHOLD) {
            acc.push({
              message: `${project.customerInfo.firstName} ${project.customerInfo.lastName}'s project due soon on ${formatDate(finishDate)}.`,
              overdue: false,
            });
          } else if (
            daysToFinish <= OVERDUE_THRESHOLD &&
            projectTotals(project).amountRemaining > 0
          ) {
            acc.push({
              message: `${project.customerInfo.firstName} ${project.customerInfo.lastName}'s project overdue since ${formatDate(finishDate)}.`,
              overdue: true,
            });
          }
        }
      });
      return acc;
    }, []);

    if (totals.amountRemaining > AMOUNT_REMAINING_THRESHOLD) {
      notificationList.push({
        message: `Total remaining exceeds $${AMOUNT_REMAINING_THRESHOLD.toLocaleString()}: $${totals.amountRemaining.toFixed(2)}.`,
        overdue: true,
      });
    }
    return notificationList;
  }, [filteredCustomers, projectTotals, totals.amountRemaining]);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const handleDetails = useCallback(
    (projects) => {
      navigate('/home/customer-projects', { state: { projects } });
    },
    [navigate]
  );

  const handleEdit = useCallback(
    (projectId) => {
      if (!projectId) {
        alert('Please select a specific project to edit');
        return;
      }
      navigate(`/home/edit/${projectId}`);
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (projectId) => {
      if (!projectId) {
        alert('Please select a specific project to delete');
        return;
      }

      if (window.confirm('Are you sure you want to delete this project?')) {
        setIsLoading(true);
        try {
          await deleteProject(projectId);
          await refreshProjects();
          alert('Project deleted successfully!');
        } catch (err) {
          setError(`Failed to delete project: ${err.message}`);
          alert('Failed to delete project.');
        } finally {
          setIsLoading(false);
        }
      }
    },
    [refreshProjects]
  );

  const handleNewProject = useCallback(
    (customerInfo) => {
      navigate('/home/customer', { state: { customerInfo } });
    },
    [navigate]
  );

  const handleExportCSV = useCallback(() => {
    const headers = [
      'First Name',
      'Last Name',
      'Phone Number',
      'Project Count',
      'Earliest Start Date',
      'Latest Finish Date',
      'Status',
      'Total Amount Remaining',
      'Total Grand Total',
    ];
    const rows = filteredCustomers.map((customer) => [
      customer.customerInfo.firstName || 'N/A',
      customer.customerInfo.lastName || 'N/A',
      formatPhoneNumber(customer.customerInfo.phone),
      customer.projects.length,
      formatDate(customer.earliestStartDate) || 'N/A',
      formatDate(customer.latestFinishDate) || 'N/A',
      customer.status,
      `$${customer.totalAmountRemaining.toFixed(2)}`,
      `$${customer.totalGrandTotal.toFixed(2)}`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [filteredCustomers]);

  return {
    projects,
    searchQuery,
    setSearchQuery,
    filteredCustomers,
    paginatedCustomers,
    totalPages,
    currentPage,
    setCurrentPage,
    isLoading,
    setIsLoading,
    error,
    lastUpdated,
    totals,
    notifications,
    isNotificationsOpen,
    setIsNotificationsOpen,
    handleSort,
    handleDetails,
    handleEdit,
    handleDelete,
    handleNewProject,
    handleExportCSV,
    sortConfig,
    formatPhoneNumber,
    formatDate,
    navigate,
    refreshProjects,
    statusFilter,
    setStatusFilter,
  };
};