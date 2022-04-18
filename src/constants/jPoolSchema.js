import { PublicKey } from '@solana/web3.js'

const address = 'CtMyWsrUtAwXWiGr9WjHT5fC3p3fgV8cyGpLTo2LJzG1'

class Fee {
  constructor(data) {
    Object.assign(this, data)
  }
}

class AccountType {
  constructor(data) {
    Object.assign(this, data)
  }
}

class AccountTypeEnum {
  constructor(data) {
    Object.assign(this, data)
  }
}

class StakePool {
  constructor(data) {
    Object.assign(this, data)
  }
}

class ValidatorList {
  constructor(data) {
    Object.assign(this, data)
  }
}

class ValidatorStakeInfo {
  constructor(data) {
    Object.assign(this, data)
  }
}

class StakeStatus {
  constructor(data) {
    Object.assign(this, data)
  }
}

class StakeStatusEnum {
  constructor(data) {
    Object.assign(this, data)
  }
}

class Lockup {
  constructor(data) {
    Object.assign(this, data)
  }
}

const schema = new Map([
  [
    PublicKey,
    {
      kind: 'struct',
      fields: [
        ['_bn', 'u256']
      ]
    }
  ],
  [
    Fee,
    {
      kind: 'struct',
      fields: [
        ['denominator', 'u64'],
        ['numerator', 'u64']
      ]
    }
  ],
  [
    Lockup,
    {
      kind: 'struct',
      fields: [
        ['unixtime', 'u64'],
        ['epoch', 'u64'],
        ['custodian', PublicKey]
      ]
    }
  ],
  [
    AccountType,
    {
      kind: 'enum',
      field: 'enum',
      values: [
        ['Uninitialized', 'u64'],
        ['StakePool', 'u64'],
        ['ValidatorList', PublicKey]
      ]
    }
  ],
  [
    AccountTypeEnum,
    {
      kind: 'struct',
      fields: []
    }
  ],
  [
    StakePool,
    {
      kind: 'struct',
      fields: [
        ['accountType', 'u8'],
        ['manager', PublicKey],
        ['staker', PublicKey],
        ['stakeDepositAuthority', PublicKey],
        ['stakeWithdrawBumpSeed', 'u8'],
        ['validatorList', PublicKey],
        ['reserveStake', PublicKey],
        ['poolMint', PublicKey],
        ['managerFeeAccount', PublicKey],
        ['tokenProgramId', PublicKey],
        ['totalLamports', 'u64'],
        ['poolTokenSupply', 'u64'],
        ['lastUpdateEpoch', 'u64']
      ]
    }
  ],
  [
    ValidatorList,
    {
      kind: 'struct',
      fields: [
        ['accountType', AccountType],
        ['maxValidators', 'u32'],
        ['validators', [ValidatorStakeInfo]]
      ]
    }
  ],
  [
    StakeStatus,
    {
      kind: 'enum',
      field: 'enum',
      values: [
        ['Active', StakeStatusEnum],
        ['DeactivatingTransient', StakeStatusEnum],
        ['ReadyForRemoval', StakeStatusEnum]
      ]
    }
  ],
  [
    StakeStatusEnum,
    {
      kind: 'struct',
      fields: []
    }
  ],
  [
    ValidatorStakeInfo,
    {
      kind: 'struct',
      fields: [
        ['activeStakeLamports', 'u64'],
        ['transientStakeLamports', 'u64'],
        ['lastUpdateEpoch', 'u64'],
        ['transientSeedSuffixStart', 'u64'],
        ['transientSeedSuffixEnd', 'u64'],
        ['status', StakeStatus],
        ['voteAccountAddress', PublicKey]
      ]
    }
  ]
])

export default {
  address,
  StakePool,
  schema
}
