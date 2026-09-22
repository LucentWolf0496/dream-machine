// 三层密码 SHA-256 哈希值
// 替换方法：node -e "console.log(require('crypto').createHash('sha256').update('新密码').digest('hex'))"
export const PASSWORD_HASHES = {
  lucent: '877f4dccd4a347c24ceef999ccb9daa160e44ee9cb4b32d6da385a101a542495',   // LucentWolf
  deep: 'dec9bd2fa57b7cd060f5d3e15e9371d3464484f14b08063a036b789ffe7c7246',     // dreamdeep
  admin: 'b72eee75788816015c33001245cd4a6b8e1f94de1585098faed4d29caacf3ed1'     // chaosadmin
}
