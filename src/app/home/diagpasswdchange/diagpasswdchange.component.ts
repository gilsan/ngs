import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface DialogData {
  // 25.09.12 암호 변경
  id: string

  userid: string;
  username: string;
  dept: string;
  work: string;
  newpassword?: string;
  repassword?: string;
}

@Component({
  selector: 'app-diagpasswdchange',
  templateUrl: './diagpasswdchange.component.html',
  styleUrls: ['./diagpasswdchange.component.scss']
})
export class DiagpasswdchangeComponent implements OnInit {

  // 25.09.12 암호 변경
  id: string;

  userid: string;
  username: string;
  newpassword = '';
  repassword = '';
  dept: string;
  work: string;

  formGroup: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<DiagpasswdchangeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    console.log('[diag]', this.data);
    // 25.09.12 암호 변경
    this.id = this.data.id;

    this.userid = this.data.userid;
    this.username = this.data.username;
    this.dept = this.data.dept;
    this.work = this.data.work;
    this.init();
  }

  init(): void {
    this.formGroup = this.fb.group({
      userid: [this.userid],
      username: [this.username],
      newpassword: ['', {
        validators: [Validators.required],
        updateOn: 'blur'
      }],
      repassword: ['', Validators.required],
      dept: [this.dept],
      work: [this.work],
    });
  }

  // 연속된 문자 또는 숫자 확인 함수
  hasSequentialChars = (pwd) => {
   for (let i = 0; i < pwd.length - 2; i++) {
     const char1 = pwd.charCodeAt(i);
     const char2 = pwd.charCodeAt(i + 1);
     const char3 = pwd.charCodeAt(i + 2);

     // 연속된 문자 또는 숫자 확인
     if (
       (char2 === char1 + 1 && char3 === char2 + 1) || // 증가
       (char2 === char1 - 1 && char3 === char2 - 1)    // 감소
     ) {
       return true;
     }
   }
   return false;
 };

  save(): void {

    // debugger;
    const user_id: HTMLInputElement = document.getElementById('userid') as HTMLInputElement;
    const password: HTMLInputElement = document.getElementById('newpassword') as HTMLInputElement;
    const user_nm: HTMLInputElement = document.getElementById('username') as HTMLInputElement;
    const confirmPassword: HTMLInputElement = document.getElementById('repassword') as HTMLInputElement;
    // this.dept: HTMLInputElement = document.getElementById('dept') as HTMLInputElement;
    //const part: HTMLInputElement = document.getElementById('part') as HTMLInputElement;
    
    console.log ("[86]save");
 
    if (password.value === '') {
      alert('암호를 입력하세요!');
      return;
    }

    if (password.value.length < 8) {
      alert("8자리 이상의 패스워드를 입력하세요!!!");
      return; 
    }

    
    if (!/[A-Za-z]/.test(password.value)) {
      alert("비밀번호에 영문자가 포함되어야 합니다.");
      return; 
    }    

    if (!/[0-9]/.test(password.value)) {
      alert("비밀번호에 숫자가 포함되어야 합니다.");
      return;
    } 

    if (!/^(?=.*[(?=.*[!@#$%^&*()_+{};|,.<>/?]).+$/.test(password.value)) {
      alert("비밀번호에 특수문자가 포함되어야 합니다.");
      return;
    }
    

    if (this.hasSequentialChars(password.value)) {
      alert("비밀번호에 연속된 숫자나 문자가 포함될 수 없습니다.");
      return;
    }

    if (confirmPassword.value === '') {
      alert('확인암호를 입력하세요!');
      return;
    }
    if (password.value !== confirmPassword.value) {
      alert('암호와 확인암호가 일치하지 않습니다.!');
      return;
    }
    if (user_nm.value === '') {
      alert('이름을 입력하세요!');
      return;
    }

    if (this.formGroup.value.newpassword !== this.formGroup.value.repassword) {
      alert('암호가 일치 하지 않습니다.');
    } else {
      this.dialogRef.close(this.formGroup.value); 

      //
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }



}
