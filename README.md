# Selecting Random Nodes for Verifiable Computing

## Protocol
1. Let C be a contract, N be a set of all K nodes in the network, and a solicitor s be a node in N who wants to delegate work to other nodes. s sends makes a transaction to C with a pledge g and a public key b such that,
    a. s has a pair of private and public keys that are generated using an asymmetric key encryption scheme
    b. g is an amount of compensation which is to be given to a node that accomplishes work
Any node n of N who wants to participate in a selection round makes a transaction to C such that,
n makes a transaction with a sha of a random number r_i, where sha(x) is a function that outputs cryptographic hash of x
n makes a transaction and it needs to arrive within a window w to be examined by C
Given a sequence of nodes BN who made a bid within a window w, and a sequence of nodes SR who have recently worked, C creates SN, a subset of B such that the following conditions hold,
C creates SN only when |BN| > 1
1 < |SN| < |BN|
A node n whose transaction comes early generally has a higher chance to be selected, with exceptions that if n is in SR it gets repositioned to the end of BN. If more than a single such node exists in BN, they are repositioned and ordered such that the least recently worked node n comes first
Nodes of SN make a transaction to C with r_i within a window w
C creates a set of integers VR and computes a random value r using gen(X) such that
Valid random numbers VR is a subset of a sequence R whose elements are all r_is transmitted such that an element of VR is unique
C computes r if and only if |VR| / |R| > THRESHOLD
gen(|SN|, VR) is a function that outputs an integer r such that 0 <= r < |SN|
C selects a node s of SN whose index is r and appends s in SR. 
C adds a pair (x,y) into a set of work W, a binary relation such that,
x is an id of node n
y is a unique identifier of work w, which C generates
C adds a pair (x,y) into a set of work proof WF, a binary relation such that,
x is a unique identifier of work w
y is a public key b which s provided
<!-- Work in progress -->


Contribution
Jun 2020

Gowri Ramachandran
Elden Park

