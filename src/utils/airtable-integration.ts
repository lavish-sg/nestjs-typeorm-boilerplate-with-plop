import axios from 'axios'; // Ensure axios is installed
import logger from './logger';
import {
  AIRTABLE_API_URL,
  TABLE_ID,
  TASK_BASE_ID,
  TEAM_TABLE_NAME,
  TEAMS_BASE_ID,
  TEAMS_TABLE_ID,
} from '@src/constants/airtable';
import { BASE_ID, AIRTABLE_API_KEY } from '@src/config/secret';

// Define interfaces for the expected structure of the employee and team data
interface EmployeeRecord {
  id: string;
  fields: {
    name: string;
    Team?: string[];
    'Legal Name'?: string;
    'Job Title'?: string;
    Department?: string;
    'Work Email'?: string;
    'Employee Status'?: string;
  };
}

export interface EmployeeDetails {
  teamName: string;
  workEmail: string;
  defaultRole?: string;
  department?: string;
  employeeStatus?: string;
}

/**
 * Fetch employee data based on the work email.
 * @returns {Promise<EmployeeDetails>} The employee details along with the team name.
 */
export async function getEmployeeAirtableDetails(
  email: string
): Promise<EmployeeDetails | unknown> {
  try {
    const employeeRecord = await fetchEmployeeRecord(email);
    const teamName = employeeRecord?.fields?.Team
      ? await fetchTeamName(employeeRecord.fields.Team[0])
      : 'N/A';

    if (employeeRecord) {
      return {
        teamName: teamName,
        workEmail: employeeRecord.fields['Work Email'],
        defaultRole: employeeRecord.fields['CTL System Default Role Name'],
        department: employeeRecord.fields['Department'],
        employeeStatus: employeeRecord.fields['Employee Status'],
      };
    } else {
      return {};
    }
  } catch (error) {
    logger.error({ msg: 'Error fetching employee details', error });
    return [];
  }
}

/**
 * Fetch employee record from Airtable.
 * @returns {Promise<EmployeeRecord>} The employee record.
 */
async function fetchEmployeeRecord(email: string): Promise<EmployeeRecord> {
  const url = `${AIRTABLE_API_URL}/${BASE_ID}/${TABLE_ID}?fields[]=Name&fields[]=Team&fields[]=Legal%20Name&fields[]=Job%20Title&fields[]=Department&fields[]=Work%20Email&fields[]=Employee%20Status&filterByFormula={Work%20Email}='${email}'`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    throw new Error(`Network response was not ok: ${response.statusText}`);
  }

  const employeeData = response.data;

  if (!employeeData.records || employeeData.records.length === 0) {
    logger.error({ msg: 'No employee found with the specified email', email });
    throw new Error('No employee found with the specified email');
  }

  return employeeData.records[0];
}

/**
 * Fetch team name based on team ID.
 * @param {string} teamId - The ID of the team.
 * @returns {Promise<string>} The name of the team or 'N/A'.
 */
async function fetchTeamName(teamId: string): Promise<string> {
  const url = `${AIRTABLE_API_URL}/${BASE_ID}/${TEAM_TABLE_NAME}?fields[]=Name&filterByFormula=RECORD_ID()='${teamId}'`;

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    throw new Error(`Network response was not ok while fetching team: ${response.statusText}`);
  }

  const teamData = response.data;
  return teamData.records && teamData.records.length > 0 ? teamData.records[0].fields.Name : 'N/A';
}

export async function fetchAirtableTeams(): Promise<string[]> {
  try {
    const url = `${AIRTABLE_API_URL}/${TEAMS_BASE_ID}/${TEAMS_TABLE_ID}?fields[]=Name`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 200) {
      throw new Error(`Network response was not ok while fetching teams: ${response.statusText}`);
    }

    const teamData = response.data;
    return teamData.records && teamData.records.length > 0
      ? teamData.records.map((record: any) => record.fields.Name || 'N/A')
      : [];
  } catch (error) {
    logger.error({ msg: 'Error fetching employee details', error });
    return [];
  }
}

/**
 * Fetch tasks based on the provided job code.
 * @param {string} jobCode - The job code to search for.
 * @param {string} page - The page for pagination.
 * @param {string} size - The page for pagination.
 * @returns {Promise<any>} The tasks data.
 */
export async function fetchAirtableTasks(jobCode: string, offset?: string): Promise<any> {
  offset = offset ? `&offset=${offset}` : '';
  jobCode = jobCode ? `&filterByFormula=SEARCH("${jobCode}", {JobCode_JobName})` : '';

  const url = `${AIRTABLE_API_URL}/${TASK_BASE_ID}/${TABLE_ID}?fields[]=Design Task${offset}${jobCode}`;
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    throw new Error(`Network response was not ok: ${response?.statusText}`);
  }

  for (const record of response.data.records) {
    record['airtableTaskName'] = record?.fields['Design Task'] || '';
    delete record?.fields;
  }

  return response.data;
}
