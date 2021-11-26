# Animal Budget

<br>

## Description

Have a track of your finances.
<br>

## User stories

- **404** - As a user I want to see a unique 404 error page.
- **500** - As a user I want to see a unique 500 error page.
- **login-signup** - As a user I want to see a welcome page that has a short introduction about the website and gives me the option to either log in as an existing user, or sign up with a new account.
- **signup** - As a user I want to sign up easily.
- **login** - As a user I want to log in easily.
- **logout** - As a user I want to be able to log out.
- **create-wallet** - As a user I want to create easy a new wallet for tracking my finances.
- **user-profile** - As a user I want to see a short overview about my informations and wallets.
- **user-settings** - As a user I want easily to edit my informations.
- **wallet** - As a user I want to see a detailed page for the current month in my wallet.
- **wallet-filter** - As a user I want to see a detailed page for my wallet, where I can filter the spendings and incomes.
- **wallet-edit** - As a user I want to edit my wallet easily.
  <br>

## Views

- [x] layout.hbs
- [x] index.hbs
- [x] error.hbs
- [x] not-found.hbs
- [x] userProfile.hbs
- [x] user.Settings.hbs
- [x] createWallet.hbs
- [x] wallet.hbs
- [x] editWallet.hbs
- [x] walletFilter.hbs
      <br>

## API routes (back-end)

- [x] GET /
- [x] POST /login
- [x] POST /signup
- [x] GET /logout
- [x] GET /profile
- [x] GET /profile/settings
- [x] POST /profile/settings
- [x] POST /profile/delete
- [x] GET /create
- [x] POST /create
- [x] GET /:walletId
- [x] POST /:walletId
- [x] GET /:walletId/edit
- [x] POST /:walletId/edit
- [x] POST /:walletId/delete
- [x] GET /:walletId/filter
- [x] POST /:walletId/filter
- [x] POST /movement/:movementId
- [x] POST /movement/:movementId/delete

<br>

## Models

- [x] User.model.js

  - new Schema ({

        - \_id: ,
        - username: {type: String, required: true, unique: true},
        - email: {type: String, required: true, unique: true},
        - password: {type: String, required:true},
        - animalUrl: {type: String, required: true},
        - firstName: String,
        - lastName: String,
          },
        {
        - timestamps: true
        })

    <br>

- [x] Wallet.model.js

  - new Schema ({

        - \_id: ,
        - walletName: {type: String, required: true},
        - currency: {type: String, required: true},
        - startingDate: {type: Date, required: true},
        - savingPlan: {type: String, required: true},
        - monthlyIncome: {type: Schema.Types.Decimal128},
        - monthlySpending: {type: Schema.Types.Decimal128},
        - balance: {type: Schema.Types.Decimal128},
        - saving: {type: Schema.Types.Decimal128},
        - shared: Boolean
        - user: [{type: Schema.Types.ObjectId, ref: 'User'}],
          })

    <br>

- [x] WalletMovement.model.js

  - new Schema ({

        - \_id: ,
        - kind: {type: String, required: true},
        - amount: {type: Schema.Types.Decimal128, required: true},
        - category: {type: String, required: true},
        - date: {type: Date, required: true},
        - wallet: {type: Schema.Types.ObjectId, ref: 'Wallet'},
          })

    <br>

## Backlog

- [x] Dark mode
- [x] Shared wallet
- [x] Reminders
- [ ] Achievments
- [ ] loading Screen
- [x] edit and delete the movements

<br>

## Links

[Trello Link] (https://trello.com/b/PIQNOwmb/animal-budget)

### Git

[Repository Link] (https://github.com/tammidnight/animal-budget)

[Deploy Link] (https://animal-budget.herokuapp.com/)

<br>

### Slides

[Google Slides Link] (https://docs.google.com/presentation/d/1Bvuzj7so1ysJInGgAg6ZXOGJ1ev-oLHKWDwAOrciiEk/edit#slide=id.g10463e93e9c_0_5)
