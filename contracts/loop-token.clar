;; LOOP Token Implementation
(define-fungible-token loop-token)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-insufficient-balance (err u101))

;; Token info
(define-data-var token-name (string-ascii 32) "LOOP Token")
(define-data-var token-symbol (string-ascii 10) "LOOP")

;; Public functions
(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err u1))
    (ft-transfer? loop-token amount sender recipient)
  )
)

(define-public (mint (amount uint) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (ft-mint? loop-token amount recipient)
  )
)

;; Read only functions
(define-read-only (get-name)
  (ok (var-get token-name))
)

(define-read-only (get-symbol)
  (ok (var-get token-symbol))
)

(define-read-only (get-balance (account principal))
  (ok (ft-get-balance loop-token account))
)
