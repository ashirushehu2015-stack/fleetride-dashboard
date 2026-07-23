# Security Specification

## 1. Data Invariants
- `drivers`: All driver records must contain an ID, name, vehicle type, plate number, and status.
- `passengers`: All passenger records must contain an ID, name, balance, and status.
- `trips`: All trip records must contain a valid trip ID, non-negative price, and valid status string.

## 2. Dirty Dozen Payloads
1. Driver creation missing name
2. Driver update with invalid vehicle type length
3. Passenger creation missing status
4. Passenger update with negative balance
5. Trip creation with invalid status field
6. Trip creation with non-numeric price
7. Unauthenticated user write to drivers
8. Oversized string payload in driver plateNumber
9. Unauthenticated read access violation
10. Malformed document ID injection in trips
11. Injection of illegal ghost fields in drivers
12. Invalid rating property type in passengers
