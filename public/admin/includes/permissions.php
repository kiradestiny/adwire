<?php
/**
 * ADWire Admin Panel — 角色與權限定義（單一來源）
 *
 * 三種角色：
 *   super_admin 超級管理員 — 全部權限（含帳號管理、資料庫遷移）
 *   editor      編輯       — 管理網站內容（品牌／文章／案例／查詢）＋發佈，唔可以管帳號
 *   viewer      只讀       — 只可以睇，唔可以改任何嘢
 *
 * 注意：所有權限檢查必須在【伺服器端】執行（Auth::requireCapability()）。
 *       介面上隱藏按鈕只係 UX，唔係安全邊界。
 */

const ADW_ROLES = [
    'super_admin' => ['label' => '超級管理員', 'badge' => 'danger',  'desc' => '全部權限，包括帳號管理與系統遷移'],
    'editor'      => ['label' => '編輯',       'badge' => 'primary', 'desc' => '管理網站內容及發佈，唔可以管理帳號'],
    'viewer'      => ['label' => '只讀',       'badge' => 'secondary','desc' => '只可以查看，唔可以修改任何內容'],
];

/** 每個角色擁有嘅能力 */
const ADW_ROLE_CAPS = [
    'super_admin' => [
        'content.view', 'content.edit', 'content.delete',
        'enquiry.view', 'enquiry.manage',
        'publish', 'users.manage', 'migrate.run', 'audit.view',
    ],
    'editor' => [
        'content.view', 'content.edit', 'content.delete',
        'enquiry.view', 'enquiry.manage',
        'publish',
    ],
    'viewer' => [
        'content.view', 'enquiry.view',
    ],
];

/** 能力嘅中文說明（用於介面提示） */
const ADW_CAP_LABELS = [
    'content.view'   => '查看內容',
    'content.edit'   => '新增／修改內容',
    'content.delete' => '刪除內容',
    'enquiry.view'   => '查看查詢',
    'enquiry.manage' => '處理查詢（更新狀態／備註）',
    'publish'        => '發佈更新（重新建置網站）',
    'users.manage'   => '管理帳號',
    'migrate.run'    => '執行資料庫遷移',
    'audit.view'     => '查看審計日誌',
];

function adw_role_label(string $role): string
{
    return ADW_ROLES[$role]['label'] ?? $role;
}

function adw_role_badge(string $role): string
{
    return ADW_ROLES[$role]['badge'] ?? 'secondary';
}

function adw_role_caps(string $role): array
{
    return ADW_ROLE_CAPS[$role] ?? [];
}

function adw_role_has(string $role, string $cap): bool
{
    return in_array($cap, adw_role_caps($role), true);
}

function adw_valid_role(string $role): bool
{
    return isset(ADW_ROLES[$role]);
}
