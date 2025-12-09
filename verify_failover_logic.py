import unittest
from unittest.mock import MagicMock
from g2b_crawler import G2BAPIClient

class TestG2BFailover(unittest.TestCase):
    def test_failover(self):
        # Setup: 2 Keys (First invalid, Second valid)
        keys = ['INVALID_KEY', 'VALID_KEY']
        client = G2BAPIClient(keys)
        
        # Mock Session
        mock_response_fail = MagicMock()
        mock_response_fail.status_code = 401 # Simulate Auth Error
        
        mock_response_success = MagicMock()
        mock_response_success.status_code = 200
        mock_response_success.json.return_value = {
            'response': {
                'header': {'resultCode': '00'},
                'body': {'items': []}
            }
        }
        
        # Side effect: First call returns fail, Second returns success
        client.session.get = MagicMock(side_effect=[mock_response_fail, mock_response_success])
        
        # Action
        result = client._make_request('http://fake', 'endpoint', {})
        
        # Assertions
        # 1. Should succeed (return valid body)
        self.assertIsNotNone(result)
        
        # 2. Should have tried 2 times
        self.assertEqual(client.session.get.call_count, 2)
        
        # 3. Current key index should be 1 (second key)
        self.assertEqual(client.current_key_idx, 1)
        
        print("✅ Failover Logic Verified: Switched to 2nd key after 401 error.")

if __name__ == '__main__':
    unittest.main()
