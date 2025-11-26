#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GitHub Secrets 검증 스크립트
파일명: verify_secrets.py
목적: GitHub Actions에서 사용하는 환경 변수가 올바르게 설정되었는지 검증

사용법:
    python verify_secrets.py

환경 변수:
    GOOGLE_CREDENTIALS_JSON: Google Service Account JSON (필수)
    SPREADSHEET_ID: Google Sheets 문서 ID (필수)
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Tuple

# 색상 출력용 ANSI 코드
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text: str):
    """헤더 출력"""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text:^60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")

def print_success(text: str):
    """성공 메시지 출력"""
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_warning(text: str):
    """경고 메시지 출력"""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")

def print_error(text: str):
    """오류 메시지 출력"""
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_info(text: str):
    """정보 메시지 출력"""
    print(f"{Colors.BLUE}ℹ {text}{Colors.END}")

class SecretsValidator:
    """Secrets 검증 클래스"""

    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []
        self.credentials_data: Dict = {}
        self.spreadsheet_id: str = ""

    def validate_all(self) -> bool:
        """모든 검증 실행"""
        print_header("GitHub Secrets 검증 시작")

        # 1. 환경 변수 존재 확인
        env_check = self.check_environment_variables()

        # 2. Google Credentials JSON 검증
        json_check = self.validate_credentials_json()

        # 3. Spreadsheet ID 검증
        spreadsheet_check = self.validate_spreadsheet_id()

        # 4. Google Sheets API 접근 테스트
        api_check = self.test_google_sheets_access()

        # 5. 결과 요약
        self.print_summary()

        # 모든 검증 통과 여부
        return all([env_check, json_check, spreadsheet_check])

    def check_environment_variables(self) -> bool:
        """환경 변수 존재 확인"""
        print_header("1. 환경 변수 확인")

        required_vars = {
            'GOOGLE_CREDENTIALS_JSON': '필수',
            'SPREADSHEET_ID': '필수'
        }

        optional_vars = {
            'SLACK_BOT_TOKEN': '선택 (Slack 알림)',
            'SLACK_CHANNEL_ID': '선택 (Slack 알림)',
            'MAIL_USERNAME': '선택 (Email 알림)',
            'MAIL_PASSWORD': '선택 (Email 알림)',
            'NOTIFICATION_EMAIL': '선택 (Email 알림)'
        }

        all_passed = True

        # 필수 환경 변수 확인
        for var_name, description in required_vars.items():
            value = os.getenv(var_name)
            if value:
                # 값 일부만 표시 (보안)
                masked_value = f"{value[:10]}...{value[-10:]}" if len(value) > 20 else "***"
                print_success(f"{var_name}: {masked_value} ({description})")
            else:
                print_error(f"{var_name}: 설정되지 않음 ({description})")
                self.errors.append(f"{var_name} 환경 변수가 설정되지 않았습니다")
                all_passed = False

        print()

        # 선택 환경 변수 확인
        for var_name, description in optional_vars.items():
            value = os.getenv(var_name)
            if value:
                masked_value = f"{value[:5]}..." if len(value) > 5 else "***"
                print_success(f"{var_name}: {masked_value} ({description})")
            else:
                print_warning(f"{var_name}: 설정되지 않음 ({description})")

        return all_passed

    def validate_credentials_json(self) -> bool:
        """Google Credentials JSON 검증"""
        print_header("2. Google Credentials JSON 검증")

        credentials_json = os.getenv('GOOGLE_CREDENTIALS_JSON')

        if not credentials_json:
            print_error("GOOGLE_CREDENTIALS_JSON 환경 변수가 없습니다")
            return False

        # JSON 파싱 테스트
        try:
            self.credentials_data = json.loads(credentials_json)
            print_success("JSON 파싱 성공")
        except json.JSONDecodeError as e:
            print_error(f"JSON 파싱 실패: {e}")
            self.errors.append(f"잘못된 JSON 형식: {e}")
            return False

        # 필수 필드 확인
        required_fields = [
            'type',
            'project_id',
            'private_key_id',
            'private_key',
            'client_email',
            'client_id',
            'auth_uri',
            'token_uri'
        ]

        missing_fields = []
        for field in required_fields:
            if field in self.credentials_data:
                # 민감 정보는 일부만 표시
                if field == 'private_key':
                    value_preview = "-----BEGIN PRIVATE KEY-----..."
                elif field == 'client_email':
                    value_preview = self.credentials_data[field]
                elif field in ['private_key_id', 'client_id']:
                    value_preview = f"{self.credentials_data[field][:10]}..."
                else:
                    value_preview = str(self.credentials_data[field])[:50]

                print_success(f"{field}: {value_preview}")
            else:
                missing_fields.append(field)
                print_error(f"{field}: 없음")

        if missing_fields:
            self.errors.append(f"누락된 필드: {', '.join(missing_fields)}")
            return False

        # Service Account 타입 확인
        if self.credentials_data.get('type') != 'service_account':
            print_error(f"잘못된 타입: {self.credentials_data.get('type')} (service_account여야 함)")
            self.errors.append("Credentials 타입이 'service_account'가 아닙니다")
            return False

        # Private Key 형식 확인
        private_key = self.credentials_data.get('private_key', '')
        if not private_key.startswith('-----BEGIN PRIVATE KEY-----'):
            print_error("Private Key 형식이 올바르지 않습니다")
            self.errors.append("Private Key가 PEM 형식이 아닙니다")
            return False

        # 개행 문자 확인
        if '\\n' not in private_key and '\n' not in private_key:
            print_warning("Private Key에 개행 문자가 없을 수 있습니다")
            self.warnings.append("Private Key 형식을 다시 확인하세요")

        print_success("모든 필수 필드 확인 완료")
        return True

    def validate_spreadsheet_id(self) -> bool:
        """Spreadsheet ID 검증"""
        print_header("3. Spreadsheet ID 검증")

        self.spreadsheet_id = os.getenv('SPREADSHEET_ID', '')

        if not self.spreadsheet_id:
            print_error("SPREADSHEET_ID 환경 변수가 없습니다")
            self.errors.append("SPREADSHEET_ID가 설정되지 않았습니다")
            return False

        print_success(f"Spreadsheet ID: {self.spreadsheet_id}")

        # ID 길이 확인 (일반적으로 44자)
        if len(self.spreadsheet_id) < 40:
            print_warning(f"ID 길이가 짧습니다 ({len(self.spreadsheet_id)}자)")
            self.warnings.append("Spreadsheet ID 길이가 비정상적으로 짧습니다")

        # 특수 문자 확인
        if not self.spreadsheet_id.replace('-', '').replace('_', '').isalnum():
            print_warning("ID에 예상치 못한 특수 문자가 포함되어 있습니다")
            self.warnings.append("Spreadsheet ID 형식을 다시 확인하세요")

        # URL 형식 확인 (잘못된 경우)
        if 'docs.google.com' in self.spreadsheet_id or '/' in self.spreadsheet_id:
            print_error("전체 URL이 아닌 ID만 입력해야 합니다")
            print_info("올바른 형식: 1lXwc_EvZ-2jGGanLsUX5eRl1eN9C2ozJzXyDMzjd5Qw")
            print_info(f"잘못된 형식: {self.spreadsheet_id}")
            self.errors.append("Spreadsheet ID 형식이 잘못되었습니다 (URL 전체가 아닌 ID만 필요)")
            return False

        print_success("Spreadsheet ID 형식 검증 완료")
        return True

    def test_google_sheets_access(self) -> bool:
        """Google Sheets API 접근 테스트"""
        print_header("4. Google Sheets API 접근 테스트")

        # 필수 라이브러리 확인
        try:
            from google.oauth2 import service_account
            from googleapiclient.discovery import build
            print_success("필수 라이브러리 확인 완료")
        except ImportError as e:
            print_error(f"필수 라이브러리 누락: {e}")
            print_info("다음 명령으로 설치하세요:")
            print_info("  pip install google-auth google-auth-oauthlib google-api-python-client")
            self.errors.append("Google API 라이브러리가 설치되지 않았습니다")
            return False

        # Credentials 객체 생성 테스트
        if not self.credentials_data:
            print_warning("Credentials JSON 검증을 먼저 통과해야 합니다")
            return False

        try:
            credentials = service_account.Credentials.from_service_account_info(
                self.credentials_data,
                scopes=['https://www.googleapis.com/auth/spreadsheets']
            )
            print_success("Credentials 객체 생성 성공")
        except Exception as e:
            print_error(f"Credentials 생성 실패: {e}")
            self.errors.append(f"Credentials 객체 생성 오류: {e}")
            return False

        # Google Sheets API 접근 테스트
        if not self.spreadsheet_id:
            print_warning("Spreadsheet ID 검증을 먼저 통과해야 합니다")
            return False

        try:
            service = build('sheets', 'v4', credentials=credentials)
            print_success("Google Sheets API 서비스 생성 성공")

            # 실제 시트 메타데이터 읽기 테스트
            spreadsheet = service.spreadsheets().get(
                spreadsheetId=self.spreadsheet_id
            ).execute()

            # 시트 정보 출력
            title = spreadsheet.get('properties', {}).get('title', 'Unknown')
            sheets = spreadsheet.get('sheets', [])
            sheet_names = [sheet['properties']['title'] for sheet in sheets]

            print_success(f"Spreadsheet 접근 성공: '{title}'")
            print_info(f"시트 개수: {len(sheets)}")
            print_info(f"시트 이름: {', '.join(sheet_names)}")

            # 권한 확인 (읽기 테스트)
            try:
                result = service.spreadsheets().values().get(
                    spreadsheetId=self.spreadsheet_id,
                    range='A1:B1'
                ).execute()
                print_success("읽기 권한 확인 완료")
            except Exception as e:
                print_warning(f"읽기 테스트 실패: {e}")
                self.warnings.append("읽기 권한이 제한적일 수 있습니다")

            # 쓰기 권한 테스트는 건너뜀 (실제 데이터 변경 방지)
            print_info("쓰기 권한은 실제 실행 시 확인됩니다")

            return True

        except Exception as e:
            print_error(f"Google Sheets 접근 실패: {e}")

            # 상세한 오류 메시지
            if '404' in str(e):
                print_info("해결 방법:")
                print_info("  1. Spreadsheet ID가 올바른지 확인")
                print_info("  2. Spreadsheet가 삭제되지 않았는지 확인")
                self.errors.append("Spreadsheet를 찾을 수 없습니다 (404)")
            elif '403' in str(e):
                print_info("해결 방법:")
                print_info("  1. Service Account 이메일로 시트 공유 확인")
                print_info(f"     이메일: {self.credentials_data.get('client_email', 'N/A')}")
                print_info("  2. 공유 권한: '편집자' 이상 필요")
                self.errors.append("권한이 없습니다 (403) - Service Account를 시트에 공유하세요")
            else:
                self.errors.append(f"API 접근 오류: {e}")

            return False

    def print_summary(self):
        """검증 결과 요약"""
        print_header("검증 결과 요약")

        total_checks = 4
        passed_checks = total_checks - len(self.errors)

        print(f"총 검사 항목: {total_checks}")
        print_success(f"통과: {passed_checks}")

        if self.errors:
            print_error(f"실패: {len(self.errors)}")
            print("\n오류 목록:")
            for i, error in enumerate(self.errors, 1):
                print(f"  {i}. {error}")

        if self.warnings:
            print_warning(f"\n경고: {len(self.warnings)}")
            print("경고 목록:")
            for i, warning in enumerate(self.warnings, 1):
                print(f"  {i}. {warning}")

        print()

        if self.errors:
            print_error("❌ 검증 실패: 위 오류를 수정하세요")
            print_info("\n상세 가이드:")
            print_info("  파일: GitHub_Secrets_설정_가이드.md")
            print_info("  섹션: 문제 해결")
        else:
            print_success("✅ 모든 검증 통과!")
            print_info("GitHub Actions에서 정상적으로 실행될 것입니다")

def main():
    """메인 함수"""
    validator = SecretsValidator()

    try:
        success = validator.validate_all()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n검증이 중단되었습니다")
        sys.exit(130)
    except Exception as e:
        print_error(f"\n예상치 못한 오류 발생: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
