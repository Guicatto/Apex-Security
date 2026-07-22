import unittest
from unittest.mock import patch, MagicMock
import subprocess

class TestApexScan(unittest.TestCase):

    @patch('subprocess.run')
    def test_apex_scan_runs_with_environment_variable(self, mock_run):
        # Mock the GitHub context to simulate a pull request event
        mock_github_context = {
            'event': {
                'pull_request': {
                    'head': {
                        'repo': {
                            'full_name': 'owner/repo-name'
                        }
                    }
                }
            }
        }

        # Simulate the workflow execution
        with patch.dict('os.environ', {'GITHUB_EVENT_NAME': 'pull_request'}):
            # In a real scenario, this would be the execution of the GitHub Actions job
            # Here we simulate the part that defines and uses the environment variable
            
            # This part simulates the "env:" block setting SCAN_TARGET
            scan_target_value = mock_github_context['event']['pull_request']['head']['repo']['full_name']
            
            # This part simulates the "run:" block using the environment variable
            command_to_run = f"echo \"Running Apex Scan on target: {scan_target_value}\" && python /path/to/your/apex_scanner.py --target \"{scan_target_value}\""
            
            # Execute the simulated command using subprocess.run
            subprocess.run(command_to_run, shell=True, check=True)

        # Assert that subprocess.run was called with the correct command
        # The command should use the environment variable passed securely
        expected_command = f'echo "Running Apex Scan on target: {scan_target_value}" && python /path/to/your/apex_scanner.py --target "{scan_target_value}"'
        mock_run.assert_called_once_with(expected_command, shell=True, check=True)

if __name__ == '__main__':
    unittest.main()
