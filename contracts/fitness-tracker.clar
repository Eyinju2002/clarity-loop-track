;; Fitness Tracking Implementation

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))

;; Data structures
(define-map activities 
  { user: principal, activity-id: uint } 
  { activity-type: (string-ascii 32), timestamp: uint, distance: uint, duration: uint, rewarded: bool }
)

(define-data-var activity-counter uint u0)

;; Public functions
(define-public (record-activity (activity-type (string-ascii 32)) (distance uint) (duration uint))
  (let
    (
      (activity-id (var-get activity-counter))
    )
    (begin
      (map-set activities 
        { user: tx-sender, activity-id: activity-id }
        { activity-type: activity-type, timestamp: block-height, distance: distance, duration: duration, rewarded: false }
      )
      (var-set activity-counter (+ activity-id u1))
      (ok activity-id)
    )
  )
)

(define-public (claim-rewards (activity-id uint))
  (let
    (
      (activity (unwrap! (get-activity tx-sender activity-id) (err u404)))
    )
    (begin
      (asserts! (not (get rewarded activity)) (err u403))
      (try! (contract-call? .loop-token mint (calculate-reward activity) tx-sender))
      (map-set activities 
        { user: tx-sender, activity-id: activity-id }
        (merge activity { rewarded: true })
      )
      (ok true)
    )
  )
)

;; Read only functions
(define-read-only (get-activity (user principal) (activity-id uint))
  (map-get? activities { user: user, activity-id: activity-id })
)

(define-read-only (calculate-reward (activity { activity-type: (string-ascii 32), timestamp: uint, distance: uint, duration: uint, rewarded: bool }))
  ;; Basic reward calculation based on distance and duration
  (/ (* distance duration) u100)
)
