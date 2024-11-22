export const PROJECT_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
};

export const PROJECT_STATUS_COLORS = {
  pending: '#ffa726',
  in_progress: '#29b6f6',
  completed: '#66bb6a',
  on_hold: '#ef5350',
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}; 