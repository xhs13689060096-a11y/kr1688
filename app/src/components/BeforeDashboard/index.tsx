import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.css'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>KR1688 — قصص عربية</h4>
      </Banner>
      {'لوحة التحكم — إدارة القصص والفصول والمستخدمين'}
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' لتهيئة قاعدة البيانات بقصص تجريبية.'}
        </li>
        <li>
          {'يمكنك إضافة القصص والفصول من خلال لوحة التحكم الجانبية.'}
        </li>
        <li>
          {'لإدارة المستخدمين والصلاحيات، انتقل إلى قائمة المستخدمين.'}
        </li>
      </ul>
    </div>
  )
}

export default BeforeDashboard
