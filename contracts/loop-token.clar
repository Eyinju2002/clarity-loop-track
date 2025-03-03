;; LOOP Token Implementation
(define-fungible-token loop-token)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-insufficient-balance (err u101))
(define-constant err-supply-cap-reached (err u102))
(define-constant token-supply-cap u1000000000)

;; Token info
(define-data-var token-name (string-ascii 32) "LOOP Token")
(define-data-var token-symbol (string-ascii 10) "LOOP")
(define-data-var total-supply uint u0)

;; Public functions
(define-public (transfer (amount uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) (err u1))
    (ft-transfer? loop-token amount sender recipient)
  )
)

(define-public (mint (amount uint) (recipient principal))
  (let
    (
      (current-supply (var-get total-supply))
      (new-supply (+ current-supply amount))
    )
    (begin
      (asserts! (is-eq tx-sender contract-owner) err-owner-only)
      (asserts! (<= new-supply token-supply-cap) err-supply-cap-reached)
      (var-set total-supply new-supply)
      (ft-mint? loop-token amount recipient)
    )
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

(define-read-only (get-total-supply)
  (ok (var-get total-supply))
)
