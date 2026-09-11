/**
 * The school's own dashboard.
 *
 * One query, not four. The warehouse dashboard fans out because its panels
 * are separately forbidden and separately expensive; a school's are neither
 * — every panel is the same school's rows — so splitting them would buy four
 * requests and nothing else.
 */

import { useQuery } from '@tanstack/react-query'
import * as dashboardApi from '@/api/dashboard'

export function useSchoolDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'school'],
    queryFn: () => dashboardApi.schoolDashboard(),
  })
}
