// Meta E5 ("lead" IC / Senior SWE) focused prep set.
// Compiled from recent public E5 interview guides and reports (frequency is
// Premium-gated / NDA-limited, so this is a best-view, not a leaked live list).
// Java solutions with the same statement -> approach -> code -> complexity -> follow-up shape.

import type { Problem } from "./practice-data";

export interface MetaRound {
  name: string;
  weight: string;
  detail: string;
}

export interface MetaCategory {
  id: string;
  name: string;
  meta: string;
  problems: Problem[];
}

export interface DesignPrompt {
  title: string;
  note: string;
}

/* ─────────────── The E5 loop ─────────────── */
export const META_LOOP: MetaRound[] = [
  {
    name: "Coding × 2",
    weight: "core bar",
    detail:
      "Two ~35-minute sessions in CoderPad, typically two mediums each (hards increasingly common). One round is now often the <b>AI-enabled</b> pilot — you may use an assistant, so the bar shifts to how you direct and verify it. <b>Dynamic programming is effectively banned</b>; expect strings/parsing, trees, graphs, intervals, and hashing.",
  },
  {
    name: "System / Product Architecture",
    weight: "level-setting",
    detail:
      "Meta pushes for concrete numbers — throughput, storage math, cache invalidation — not hand-waving. Product-architecture variants center a user-facing feature (a widget, a feed) and drill the API + data model.",
  },
  {
    name: "Behavioral (\"Jedi\")",
    weight: "can down-level",
    detail:
      "A standalone 45-minute session on conflict, ambiguity, failure, and cross-functional work. Now weighted enough to move an E5 to E4 on its own — prepare specific, structured stories.",
  },
  {
    name: "Team matching",
    weight: "unscored",
    detail:
      "Not scored, but it feeds the final decision and your starting team. Come with informed questions about the org and the problem space.",
  },
];

/* ─────────────── Coding questions ─────────────── */
const STRINGS: Problem[] = [
  {
    n: "01",
    title: "Minimum Remove to Make Valid Parentheses",
    diff: "med",
    lc: "1249",
    pat: "Stack",
    statement:
      "Remove the minimum number of parentheses so the string is valid. Return any valid result. Letters stay untouched.",
    example: `s = "a)b(c)d"  ->  "ab(c)d"
s = "))(("      ->  ""`,
    approach:
      "<b>Stack of indices.</b> Push each <code>(</code> index; on a <code>)</code>, pop a matched <code>(</code> or mark this <code>)</code> for removal. Any indices left on the stack are unmatched <code>(</code>. Blank out all marked positions in one pass.",
    code: `public String minRemoveToMakeValid(String s) {
    char[] arr = s.toCharArray();
    Deque<Integer> stack = new ArrayDeque<>();
    for (int i = 0; i < arr.length; i++) {
        if (arr[i] == '(') stack.push(i);
        else if (arr[i] == ')') {
            if (!stack.isEmpty()) stack.pop();   // matched a '('
            else arr[i] = '*';                    // unmatched ')', mark it
        }
    }
    while (!stack.isEmpty()) arr[stack.pop()] = '*'; // leftover unmatched '('
    StringBuilder sb = new StringBuilder();
    for (char c : arr) if (c != '*') sb.append(c);
    return sb.toString();
}`,
    tc: "O(n)",
    sc: "O(n)",
    followup:
      "<span class='q'>Balance without a stack?</span> Two passes with a running counter — left-to-right dropping excess <code>)</code>, then right-to-left dropping excess <code>(</code>. <span class='q'>Report which indices were removed?</span> Collect the marked positions instead of blanking them.",
  },
  {
    n: "02",
    title: "Valid Palindrome II",
    diff: "easy",
    lc: "680",
    pat: "Two Pointers",
    statement:
      "Return true if the string can be a palindrome after deleting at most one character.",
    example: `s = "abca"  ->  true   (delete 'c')`,
    approach:
      "Two pointers inward. On the first mismatch, you get exactly one deletion — try skipping the left char <b>or</b> the right char and test whether either remainder is a plain palindrome.",
    code: `public boolean validPalindrome(String s) {
    int l = 0, r = s.length() - 1;
    while (l < r) {
        if (s.charAt(l) != s.charAt(r))
            return isPalin(s, l + 1, r) || isPalin(s, l, r - 1);
        l++; r--;
    }
    return true;
}
private boolean isPalin(String s, int l, int r) {
    while (l < r) if (s.charAt(l++) != s.charAt(r--)) return false;
    return true;
}`,
    tc: "O(n)",
    sc: "O(1)",
    followup:
      "<span class='q'>Allow up to k deletions?</span> That generalizes to a longest-palindromic-subsequence DP — but note Meta tends to avoid DP, so expect the k=1 version.",
  },
  {
    n: "03",
    title: "Valid Word Abbreviation",
    diff: "easy",
    lc: "408",
    pat: "Two Pointers",
    statement:
      "Given a word and an abbreviation (letters and digit-run lengths), decide whether the abbreviation is valid for the word. No leading zeros allowed.",
    example: `word = "internationalization", abbr = "i12iz4n"  ->  true`,
    approach:
      "Walk both with two pointers. On a digit, parse the full run (reject a leading zero) and jump the word pointer forward by that count. On a letter, it must match. Valid only if both pointers finish together.",
    code: `public boolean validWordAbbreviation(String word, String abbr) {
    int i = 0, j = 0;
    while (i < word.length() && j < abbr.length()) {
        if (Character.isDigit(abbr.charAt(j))) {
            if (abbr.charAt(j) == '0') return false;   // leading zero
            int num = 0;
            while (j < abbr.length() && Character.isDigit(abbr.charAt(j)))
                num = num * 10 + (abbr.charAt(j++) - '0');
            i += num;                                   // skip that many chars
        } else {
            if (word.charAt(i++) != abbr.charAt(j++)) return false;
        }
    }
    return i == word.length() && j == abbr.length();
}`,
    tc: "O(n)",
    sc: "O(1)",
    followup:
      "<span class='q'>Generate all abbreviations, or match many abbreviations to one word?</span> Precompute or use a trie of abbreviations; the single-check logic here stays the inner routine.",
  },
  {
    n: "04",
    title: "Basic Calculator II",
    diff: "med",
    lc: "227",
    pat: "Stack",
    statement:
      "Evaluate a string expression with non-negative integers and the operators + - * / (integer division, no parentheses).",
    example: `s = "3+2*2"  ->  7
s = " 3/2 "   ->  1`,
    approach:
      "Carry the <b>previous operator</b>. When you finish a number, apply the pending operator: push for + / negate for -, but for * and / pop the stack top and combine immediately (precedence). The answer is the sum of the stack.",
    code: `public int calculate(String s) {
    Deque<Integer> stack = new ArrayDeque<>();
    int num = 0;
    char op = '+';
    for (int i = 0; i < s.length(); i++) {
        char c = s.charAt(i);
        if (Character.isDigit(c)) num = num * 10 + (c - '0');
        if ((!Character.isDigit(c) && c != ' ') || i == s.length() - 1) {
            if (op == '+') stack.push(num);
            else if (op == '-') stack.push(-num);
            else if (op == '*') stack.push(stack.pop() * num);
            else stack.push(stack.pop() / num);
            op = c;
            num = 0;
        }
    }
    int res = 0;
    for (int v : stack) res += v;
    return res;
}`,
    tc: "O(n)",
    sc: "O(n)",
    followup:
      "<span class='q'>Add parentheses (Basic Calculator I / III)?</span> Recurse on a substring or push the running state onto a stack at each <code>(</code> and restore at <code>)</code>.",
  },
  {
    n: "05",
    title: "Simplify Path",
    diff: "med",
    lc: "71",
    pat: "Stack",
    statement:
      "Simplify a Unix-style absolute path: collapse <code>.</code>, <code>..</code>, and repeated slashes into a canonical path.",
    example: `path = "/a/./b/../../c/"  ->  "/c"`,
    approach:
      "Split on <code>/</code> and run a stack of directory names. Ignore empty and <code>.</code> segments; <code>..</code> pops one level; anything else is pushed. Join the stack bottom-to-top.",
    code: `public String simplifyPath(String path) {
    Deque<String> stack = new ArrayDeque<>();
    for (String part : path.split("/")) {
        if (part.isEmpty() || part.equals(".")) continue;
        if (part.equals("..")) { if (!stack.isEmpty()) stack.pop(); }
        else stack.push(part);
    }
    StringBuilder sb = new StringBuilder();
    Iterator<String> it = stack.descendingIterator();   // bottom -> top
    while (it.hasNext()) sb.append('/').append(it.next());
    return sb.length() == 0 ? "/" : sb.toString();
}`,
    tc: "O(n)",
    sc: "O(n)",
    followup:
      "<span class='q'>Relative paths or symlinks?</span> The stack model extends — a leading segment without <code>/</code> starts relative, and you would resolve symlinks against a filesystem map.",
  },
  {
    n: "06",
    title: "Custom Sort String",
    diff: "med",
    lc: "791",
    pat: "Counting Sort",
    statement:
      "Reorder the characters of s so that characters follow the priority given by order. Characters not in order can go anywhere.",
    example: `order = "cba", s = "abcd"  ->  "cbad"`,
    approach:
      "Count characters of s. Emit each character of <code>order</code> as many times as it appears, then append the leftover characters. A fixed 26-count array makes it linear.",
    code: `public String customSortString(String order, String s) {
    int[] count = new int[26];
    for (char c : s.toCharArray()) count[c - 'a']++;
    StringBuilder sb = new StringBuilder();
    for (char c : order.toCharArray())
        while (count[c - 'a']-- > 0) sb.append(c);   // priority chars first
    for (char c = 'a'; c <= 'z'; c++)
        while (count[c - 'a']-- > 0) sb.append(c);   // then the rest
    return sb.toString();
}`,
    tc: "O(n)",
    sc: "O(1)",
    followup:
      "<span class='q'>Stable order for the leftovers?</span> Emit them in their original relative order by scanning s instead of the alphabet.",
  },
  {
    n: "07",
    title: "Add Strings",
    diff: "easy",
    lc: "415",
    pat: "Math / Two Pointers",
    statement:
      "Add two non-negative integers given as strings, without converting them to integers or using BigInteger.",
    example: `num1 = "99", num2 = "1"  ->  "100"`,
    approach:
      "School addition from the least-significant end, tracking a carry. Loop while either string has digits or a carry remains, appending digits and reversing at the end.",
    code: `public String addStrings(String num1, String num2) {
    int i = num1.length() - 1, j = num2.length() - 1, carry = 0;
    StringBuilder sb = new StringBuilder();
    while (i >= 0 || j >= 0 || carry > 0) {
        int sum = carry;
        if (i >= 0) sum += num1.charAt(i--) - '0';
        if (j >= 0) sum += num2.charAt(j--) - '0';
        sb.append(sum % 10);
        carry = sum / 10;
    }
    return sb.reverse().toString();
}`,
    tc: "O(max(m, n))",
    sc: "O(max(m, n))",
    followup:
      "<span class='q'>Multiply strings instead?</span> The digit product at positions i and j lands at result indices i+j and i+j+1 — the same carry idea in two dimensions.",
  },
  {
    n: "08",
    title: "Group Shifted Strings",
    diff: "med",
    lc: "249",
    pat: "Hashing",
    statement:
      "Group strings that are shift-equivalent (each letter advanced by the same amount, wrapping z->a).",
    example: `["abc","bcd","xyz","az"]  ->  [["abc","bcd","xyz"],["az"]]`,
    approach:
      "Two strings share a group iff their consecutive-difference sequence (mod 26) is identical. Build that difference signature as a canonical map key and bucket by it.",
    code: `public List<List<String>> groupStrings(String[] strings) {
    Map<String, List<String>> groups = new HashMap<>();
    for (String s : strings) {
        StringBuilder key = new StringBuilder();
        for (int i = 1; i < s.length(); i++) {
            int diff = (s.charAt(i) - s.charAt(i - 1) + 26) % 26;
            key.append(diff).append(',');            // '#'-style separator
        }
        groups.computeIfAbsent(key.toString(), k -> new ArrayList<>()).add(s);
    }
    return new ArrayList<>(groups.values());
}`,
    tc: "O(total chars)",
    sc: "O(total chars)",
    followup:
      "<span class='q'>Why the +26 and mod?</span> Shifts wrap around the alphabet, so a raw difference can be negative; normalizing keeps <code>az</code> and <code>ba</code> in the right buckets.",
  },
];

const ARRAYS: Problem[] = [
  {
    n: "09",
    title: "Subarray Sum Equals K",
    diff: "med",
    lc: "560",
    pat: "Prefix Sum + Hash",
    statement:
      "Count the number of contiguous subarrays whose sum equals k.",
    example: `nums = [1,1,1], k = 2  ->  2`,
    approach:
      "Running prefix sum plus a map of prefix-sum frequencies. A subarray ending here sums to k whenever some earlier prefix equals <code>sum - k</code>; add that count. Seed the map with prefix 0 seen once.",
    code: `public int subarraySum(int[] nums, int k) {
    Map<Integer, Integer> prefix = new HashMap<>();
    prefix.put(0, 1);
    int sum = 0, count = 0;
    for (int n : nums) {
        sum += n;
        count += prefix.getOrDefault(sum - k, 0);   // earlier prefixes that close a window
        prefix.merge(sum, 1, Integer::sum);
    }
    return count;
}`,
    tc: "O(n)",
    sc: "O(n)",
    followup:
      "<span class='q'>Longest such subarray instead of the count?</span> Store the earliest index of each prefix sum and track the max length.",
  },
  {
    n: "10",
    title: "Continuous Subarray Sum",
    diff: "med",
    lc: "523",
    pat: "Prefix Mod + Hash",
    statement:
      "Is there a contiguous subarray of length at least 2 whose sum is a multiple of k?",
    example: `nums = [23,2,4,6,7], k = 6  ->  true  ([2,4])`,
    approach:
      "Two prefix sums with the <b>same remainder mod k</b> bound a subarray whose sum is a multiple of k. Store the first index of each remainder; a later index at least two apart proves it.",
    code: `public boolean checkSubarraySum(int[] nums, int k) {
    Map<Integer, Integer> firstIndex = new HashMap<>();
    firstIndex.put(0, -1);                    // empty prefix before index 0
    int sum = 0;
    for (int i = 0; i < nums.length; i++) {
        sum += nums[i];
        int r = sum % k;
        if (firstIndex.containsKey(r)) {
            if (i - firstIndex.get(r) >= 2) return true;  // length >= 2
        } else {
            firstIndex.put(r, i);             // keep only the earliest
        }
    }
    return false;
}`,
    tc: "O(n)",
    sc: "O(min(n, k))",
    followup:
      "<span class='q'>Why keep only the first index per remainder?</span> The earliest gives the longest window, which maximizes the chance of meeting the length-2 constraint.",
  },
  {
    n: "11",
    title: "Merge Intervals",
    diff: "med",
    lc: "56",
    pat: "Sorting",
    statement:
      "Merge all overlapping intervals and return the disjoint set.",
    example: `[[1,3],[2,6],[8,10]]  ->  [[1,6],[8,10]]`,
    approach:
      "Sort by start; overlaps become adjacent. Extend the current interval's end while the next starts within it, otherwise start a new one.",
    code: `public int[][] merge(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    List<int[]> res = new ArrayList<>();
    int[] cur = intervals[0];
    res.add(cur);
    for (int[] next : intervals) {
        if (next[0] <= cur[1]) cur[1] = Math.max(cur[1], next[1]); // overlap
        else { cur = next; res.add(cur); }                        // disjoint
    }
    return res.toArray(new int[0][]);
}`,
    tc: "O(n log n)",
    sc: "O(n)",
    followup:
      "<span class='q'>Insert one interval into an already-sorted set?</span> Skip the sort — sweep once, merging around the new interval (LC 57).",
  },
  {
    n: "12",
    title: "Interval List Intersections",
    diff: "med",
    lc: "986",
    pat: "Two Pointers",
    statement:
      "Given two lists of sorted, disjoint intervals, return their pairwise intersections.",
    example: `A=[[0,2],[5,10]], B=[[1,5],[8,12]]  ->  [[1,2],[5,5],[8,10]]`,
    approach:
      "Two pointers across both lists. The overlap of the two current intervals is <code>[max(starts), min(ends)]</code>; keep it if valid, then advance the interval that ends first.",
    code: `public int[][] intervalIntersection(int[][] A, int[][] B) {
    List<int[]> res = new ArrayList<>();
    int i = 0, j = 0;
    while (i < A.length && j < B.length) {
        int lo = Math.max(A[i][0], B[j][0]);
        int hi = Math.min(A[i][1], B[j][1]);
        if (lo <= hi) res.add(new int[]{lo, hi});   // real overlap
        if (A[i][1] < B[j][1]) i++; else j++;        // drop the one ending first
    }
    return res.toArray(new int[0][]);
}`,
    tc: "O(m + n)",
    sc: "O(m + n)",
    followup:
      "<span class='q'>Union instead of intersection?</span> Merge-style sweep keeping the outer bounds; the two-pointer skeleton is the same.",
  },
  {
    n: "13",
    title: "Random Pick with Weight",
    diff: "med",
    lc: "528",
    pat: "Prefix Sum + Binary Search",
    statement:
      "Given weights, implement pickIndex() returning index i with probability proportional to w[i].",
    example: `w = [1,3]  ->  index 1 picked ~75% of the time`,
    approach:
      "Build prefix sums so each index owns a slice of <code>[1..total]</code> sized by its weight. Draw a random target in that range and binary-search the first prefix that reaches it.",
    code: `class Solution {
    private final int[] prefix;
    private final int total;
    private final Random rand = new Random();

    public Solution(int[] w) {
        prefix = new int[w.length];
        int sum = 0;
        for (int i = 0; i < w.length; i++) { sum += w[i]; prefix[i] = sum; }
        total = sum;
    }
    public int pickIndex() {
        int target = rand.nextInt(total) + 1;    // 1..total
        int lo = 0, hi = prefix.length - 1;
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (prefix[mid] < target) lo = mid + 1;
            else hi = mid;                        // first prefix >= target
        }
        return lo;
    }
}`,
    tc: "O(n) build, O(log n) pick",
    sc: "O(n)",
    followup:
      "<span class='q'>Weights update frequently?</span> A Fenwick tree gives O(log n) updates and picks; the static prefix array is best when weights are fixed.",
  },
  {
    n: "14",
    title: "Find Peak Element",
    diff: "med",
    lc: "162",
    pat: "Binary Search",
    statement:
      "Return the index of any peak (an element strictly greater than its neighbors); array ends act as negative infinity. O(log n).",
    example: `nums = [1,2,1,3,5,6,4]  ->  5 (value 6)`,
    approach:
      "Binary search on slope: if the midpoint rises toward its right neighbor, a peak lies to the right; otherwise it is at mid or to the left. Move toward the ascending side.",
    code: `public int findPeakElement(int[] nums) {
    int lo = 0, hi = nums.length - 1;
    while (lo < hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] < nums[mid + 1]) lo = mid + 1;  // climb right
        else hi = mid;                                // peak is mid or left
    }
    return lo;
}`,
    tc: "O(log n)",
    sc: "O(1)",
    followup:
      "<span class='q'>Why does climbing toward the higher neighbor always find a peak?</span> The boundaries are treated as lower, so an ascending direction must eventually turn down — a peak.",
  },
  {
    n: "15",
    title: "Buildings With an Ocean View",
    diff: "med",
    lc: "1762",
    pat: "Monotonic Scan",
    statement:
      "Buildings face right toward the ocean. Return indices (ascending) of buildings that can see it — taller than every building to their right.",
    example: `heights = [4,2,3,1]  ->  [0,2,3]`,
    approach:
      "Scan from the right tracking the tallest seen so far. A building with a view is strictly taller than that running max; record it and update. Reverse for ascending order.",
    code: `public int[] findBuildings(int[] heights) {
    List<Integer> res = new ArrayList<>();
    int maxRight = 0;
    for (int i = heights.length - 1; i >= 0; i--) {
        if (heights[i] > maxRight) {   // taller than everything to the right
            res.add(i);
            maxRight = heights[i];
        }
    }
    Collections.reverse(res);
    int[] out = new int[res.size()];
    for (int i = 0; i < out.length; i++) out[i] = res.get(i);
    return out;
}`,
    tc: "O(n)",
    sc: "O(1)",
    followup:
      "<span class='q'>A monotonic stack version?</span> Push indices while heights decrease, popping shorter buildings as a taller one arrives — same result, useful framing for the histogram family.",
  },
  {
    n: "16",
    title: "Dot Product of Two Sparse Vectors",
    diff: "med",
    lc: "1570",
    pat: "Design / Two Pointers",
    statement:
      "Efficiently compute the dot product of two sparse vectors (mostly zeros).",
    example: `a=[1,0,0,2,3], b=[0,3,0,4,0]  ->  8`,
    approach:
      "Store only non-zero <code>(index, value)</code> pairs. The dot product walks both pair lists with two pointers, multiplying only where indices match.",
    code: `class SparseVector {
    private final List<int[]> pairs = new ArrayList<>();  // [index, value]

    SparseVector(int[] nums) {
        for (int i = 0; i < nums.length; i++)
            if (nums[i] != 0) pairs.add(new int[]{i, nums[i]});
    }
    public int dotProduct(SparseVector vec) {
        int i = 0, j = 0, res = 0;
        while (i < pairs.size() && j < vec.pairs.size()) {
            int[] a = pairs.get(i), b = vec.pairs.get(j);
            if (a[0] == b[0]) { res += a[1] * b[1]; i++; j++; }
            else if (a[0] < b[0]) i++;
            else j++;
        }
        return res;
    }
}`,
    tc: "O(n) build, O(a + b) product",
    sc: "O(non-zeros)",
    followup:
      "<span class='q'>One vector far sparser than the other?</span> Store the sparse one as a hashmap and iterate only its entries, looking each index up — O(smaller).",
  },
  {
    n: "17",
    title: "K Closest Points to Origin",
    diff: "med",
    lc: "973",
    pat: "Heap / Quickselect",
    statement: "Return the k points closest to the origin.",
    example: `points = [[1,3],[-2,2]], k = 1  ->  [[-2,2]]`,
    approach:
      "A max-heap of size k keyed on squared distance (no sqrt needed) keeps the k closest — evict the farthest when it overflows. Quickselect gives O(n) average if you can reorder the array.",
    code: `public int[][] kClosest(int[][] points, int k) {
    PriorityQueue<int[]> heap = new PriorityQueue<>(
        (a, b) -> (b[0]*b[0] + b[1]*b[1]) - (a[0]*a[0] + a[1]*a[1])); // max by distance
    for (int[] p : points) {
        heap.offer(p);
        if (heap.size() > k) heap.poll();   // drop the farthest
    }
    return heap.toArray(new int[0][]);
}`,
    tc: "O(n log k)",
    sc: "O(k)",
    followup:
      "<span class='q'>Optimal average time?</span> Quickselect partitions around the k-th distance in O(n) average, at the cost of reordering the input and an O(n^2) worst case.",
  },
];

const TREES: Problem[] = [
  {
    n: "18",
    title: "Binary Tree Vertical Order Traversal",
    diff: "med",
    lc: "314",
    pat: "BFS + Column Index",
    statement:
      "Return node values column by column (left to right); within a column, top to bottom, then left to right.",
    example: `[3,9,20,null,null,15,7]  ->  [[9],[3,15],[20],[7]]`,
    approach:
      "<b>BFS carrying a column index</b> (left = col-1, right = col+1) so ties break top-to-bottom naturally. Bucket values by column and read columns from min to max. BFS (not DFS) is what gives the correct vertical ordering.",
    code: `public List<List<Integer>> verticalOrder(TreeNode root) {
    List<List<Integer>> res = new ArrayList<>();
    if (root == null) return res;
    Map<Integer, List<Integer>> cols = new HashMap<>();
    Queue<TreeNode> nodes = new LinkedList<>();
    Queue<Integer> colOf = new LinkedList<>();
    nodes.offer(root); colOf.offer(0);
    int min = 0, max = 0;
    while (!nodes.isEmpty()) {
        TreeNode node = nodes.poll();
        int col = colOf.poll();
        cols.computeIfAbsent(col, k -> new ArrayList<>()).add(node.val);
        min = Math.min(min, col); max = Math.max(max, col);
        if (node.left != null)  { nodes.offer(node.left);  colOf.offer(col - 1); }
        if (node.right != null) { nodes.offer(node.right); colOf.offer(col + 1); }
    }
    for (int c = min; c <= max; c++) res.add(cols.get(c));
    return res;
}`,
    tc: "O(n)",
    sc: "O(n)",
    followup:
      "<span class='q'>Vertical Order Traversal (LC 987) with strict sorting?</span> Ties within a row/column must sort by value — carry the row too and sort each column, making it O(n log n).",
  },
  {
    n: "19",
    title: "Diameter of Binary Tree",
    diff: "easy",
    lc: "543",
    pat: "DFS (return one, update global)",
    statement:
      "Return the length (in edges) of the longest path between any two nodes.",
    example: `[1,2,3,4,5]  ->  3`,
    approach:
      "DFS returns each node's height while a global tracks the widest path. The path <b>through</b> a node is left height plus right height; what it contributes <b>upward</b> is one plus the taller side.",
    code: `private int best;
public int diameterOfBinaryTree(TreeNode root) {
    best = 0;
    height(root);
    return best;
}
private int height(TreeNode node) {
    if (node == null) return 0;
    int left = height(node.left), right = height(node.right);
    best = Math.max(best, left + right);  // path turning here
    return 1 + Math.max(left, right);     // height upward
}`,
    tc: "O(n)",
    sc: "O(h)",
    followup:
      "<span class='q'>Return the actual path, not the length?</span> Track the node where the best was set and reconstruct left/right chains from it.",
  },
  {
    n: "20",
    title: "Binary Tree Right Side View",
    diff: "med",
    lc: "199",
    pat: "BFS",
    statement:
      "Return the values visible from the right — the last node at each level.",
    example: `[1,2,3,null,5,null,4]  ->  [1,3,4]`,
    approach:
      "Level-order BFS; take the last node dequeued on each level. Enqueue left before right so that node really is the rightmost.",
    code: `public List<Integer> rightSideView(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    if (root == null) return res;
    Queue<TreeNode> q = new LinkedList<>();
    q.offer(root);
    while (!q.isEmpty()) {
        int size = q.size();
        for (int i = 0; i < size; i++) {
            TreeNode node = q.poll();
            if (i == size - 1) res.add(node.val);   // rightmost on the level
            if (node.left != null) q.offer(node.left);
            if (node.right != null) q.offer(node.right);
        }
    }
    return res;
}`,
    tc: "O(n)",
    sc: "O(n)",
    followup:
      "<span class='q'>Left side view?</span> Take the first node of each level (i == 0) instead of the last.",
  },
  {
    n: "21",
    title: "Lowest Common Ancestor of a Binary Tree",
    diff: "med",
    lc: "236",
    pat: "DFS",
    statement:
      "Return the lowest node that is an ancestor of both p and q in a general binary tree.",
    example: `root=[3,5,1,6,2,0,8], p=5, q=1  ->  3`,
    approach:
      "Recurse; return a node if it is p, q, or null. If both children return non-null, the split happens here so this node is the LCA; otherwise bubble up whichever side found something.",
    code: `public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {
    if (root == null || root == p || root == q) return root;
    TreeNode left = lowestCommonAncestor(root.left, p, q);
    TreeNode right = lowestCommonAncestor(root.right, p, q);
    if (left != null && right != null) return root;  // split point
    return left != null ? left : right;
}`,
    tc: "O(n)",
    sc: "O(h)",
    followup:
      "<span class='q'>Nodes carry parent pointers (LCA III)?</span> Walk up from both like the intersection of two linked lists — no tree traversal needed, O(1) space beyond the pointers.",
  },
  {
    n: "22",
    title: "Range Sum of BST",
    diff: "easy",
    lc: "938",
    pat: "BST Pruning",
    statement:
      "Sum the values of all BST nodes within the inclusive range [low, high].",
    example: `root=[10,5,15,3,7,null,18], low=7, high=15  ->  32`,
    approach:
      "Use the BST order to prune: if a node is below <code>low</code>, only its right subtree can contribute; above <code>high</code>, only its left. Otherwise count it and recurse both ways.",
    code: `public int rangeSumBST(TreeNode root, int low, int high) {
    if (root == null) return 0;
    if (root.val < low)  return rangeSumBST(root.right, low, high);
    if (root.val > high) return rangeSumBST(root.left, low, high);
    return root.val
         + rangeSumBST(root.left, low, high)
         + rangeSumBST(root.right, low, high);
}`,
    tc: "O(n) worst, less with pruning",
    sc: "O(h)",
    followup:
      "<span class='q'>Many range queries on a static tree?</span> An in-order array plus prefix sums answers each query in O(log n) via binary search on the bounds.",
  },
  {
    n: "23",
    title: "Nested List Weight Sum",
    diff: "med",
    lc: "339",
    pat: "DFS",
    statement:
      "Each integer has a weight equal to its depth. Return the sum of every integer times its depth.",
    example: `[[1,1],2,[1,1]]  ->  10`,
    approach:
      "DFS carrying the current depth. Integers add value times depth; nested lists recurse at depth+1.",
    code: `public int depthSum(List<NestedInteger> nestedList) {
    return dfs(nestedList, 1);
}
private int dfs(List<NestedInteger> list, int depth) {
    int sum = 0;
    for (NestedInteger ni : list) {
        if (ni.isInteger()) sum += ni.getInteger() * depth;
        else sum += dfs(ni.getList(), depth + 1);
    }
    return sum;
}`,
    tc: "O(n) elements",
    sc: "O(d) depth",
    followup:
      "<span class='q'>Inverse weighting (LC 364), where leaves count least?</span> BFS once to find max depth, then weight each level by <code>maxDepth - level + 1</code>.",
  },
  {
    n: "24",
    title: "Sum Root to Leaf Numbers",
    diff: "med",
    lc: "129",
    pat: "DFS (state down)",
    statement:
      "Each root-to-leaf path spells a number (digits along the path). Return the sum of all such numbers.",
    example: `[1,2,3]  ->  25  (12 + 13)`,
    approach:
      "Carry the running number <b>down</b> the recursion: at each node it becomes <code>cur*10 + val</code>. At a leaf, return that number; internal nodes sum their children.",
    code: `public int sumNumbers(TreeNode root) {
    return dfs(root, 0);
}
private int dfs(TreeNode node, int cur) {
    if (node == null) return 0;
    cur = cur * 10 + node.val;
    if (node.left == null && node.right == null) return cur;  // leaf
    return dfs(node.left, cur) + dfs(node.right, cur);
}`,
    tc: "O(n)",
    sc: "O(h)",
    followup:
      "<span class='q'>Paths need not end at a leaf?</span> Add each node's running value as you go instead of only at leaves.",
  },
];

const GRAPHS: Problem[] = [
  {
    n: "25",
    title: "Number of Islands",
    diff: "med",
    lc: "200",
    pat: "Flood Fill",
    statement:
      "Count connected groups of '1' (land) in a grid of '1'/'0'.",
    example: `grid with two separated land masses  ->  2`,
    approach:
      "Each unvisited land cell starts an island; flood it (DFS in four directions), sinking cells to '0' so it is counted once. The number of flood starts is the answer.",
    code: `public int numIslands(char[][] grid) {
    int count = 0;
    for (int r = 0; r < grid.length; r++)
        for (int c = 0; c < grid[0].length; c++)
            if (grid[r][c] == '1') { count++; sink(grid, r, c); }
    return count;
}
private void sink(char[][] g, int r, int c) {
    if (r < 0 || r >= g.length || c < 0 || c >= g[0].length || g[r][c] != '1') return;
    g[r][c] = '0';
    sink(g, r + 1, c); sink(g, r - 1, c);
    sink(g, r, c + 1); sink(g, r, c - 1);
}`,
    tc: "O(m * n)",
    sc: "O(m * n)",
    followup:
      "<span class='q'>Cannot mutate the grid, or the grid is huge?</span> Use a visited set, BFS to avoid deep recursion, or Union-Find when land arrives incrementally.",
  },
  {
    n: "26",
    title: "Accounts Merge",
    diff: "med",
    lc: "721",
    pat: "Union-Find",
    statement:
      "Merge accounts that share any email (same person). Return each person's name with their emails sorted.",
    example: `two accounts sharing one email  ->  one merged account`,
    approach:
      "Union all emails within each account. Group emails by their Union-Find root, remember which name each root belongs to, then sort each group's emails.",
    code: `public List<List<String>> accountsMerge(List<List<String>> accounts) {
    Map<String, String> parent = new HashMap<>();
    Map<String, String> owner = new HashMap<>();
    for (List<String> acc : accounts)
        for (int i = 1; i < acc.size(); i++) {
            parent.putIfAbsent(acc.get(i), acc.get(i));
            owner.put(acc.get(i), acc.get(0));
            if (i > 1) union(parent, acc.get(i), acc.get(1));
        }
    Map<String, TreeSet<String>> groups = new HashMap<>();
    for (String email : parent.keySet())
        groups.computeIfAbsent(find(parent, email), k -> new TreeSet<>()).add(email);

    List<List<String>> res = new ArrayList<>();
    for (Map.Entry<String, TreeSet<String>> e : groups.entrySet()) {
        List<String> merged = new ArrayList<>();
        merged.add(owner.get(e.getKey()));
        merged.addAll(e.getValue());
        res.add(merged);
    }
    return res;
}
private String find(Map<String, String> parent, String x) {
    while (!parent.get(x).equals(x)) { parent.put(x, parent.get(parent.get(x))); x = parent.get(x); }
    return x;
}
private void union(Map<String, String> parent, String a, String b) {
    parent.put(find(parent, a), find(parent, b));
}`,
    tc: "O(A log A)",
    sc: "O(A)",
    followup:
      "<span class='q'>DFS/BFS alternative?</span> Build an email graph and flood each component — cleaner to explain, same complexity; Union-Find shines with incremental merges.",
  },
  {
    n: "27",
    title: "Exclusive Time of Functions",
    diff: "med",
    lc: "636",
    pat: "Stack",
    statement:
      "Given a single-threaded call log of start/end timestamps, return the exclusive time of each function id.",
    example: `n=2, logs=["0:start:0","1:start:2","1:end:5","0:end:6"]  ->  [3,4]`,
    approach:
      "A stack of active call ids. On <code>start</code>, credit the currently-running function for the gap since <code>prev</code>, then push. On <code>end</code>, credit the popped function through this timestamp inclusive and move <code>prev</code> past it.",
    code: `public int[] exclusiveTime(int n, List<String> logs) {
    int[] res = new int[n];
    Deque<Integer> stack = new ArrayDeque<>();
    int prev = 0;
    for (String log : logs) {
        String[] p = log.split(":");
        int id = Integer.parseInt(p[0]);
        int time = Integer.parseInt(p[2]);
        if (p[1].equals("start")) {
            if (!stack.isEmpty()) res[stack.peek()] += time - prev; // pause the caller
            stack.push(id);
            prev = time;
        } else {
            res[stack.pop()] += time - prev + 1;                    // inclusive end tick
            prev = time + 1;
        }
    }
    return res;
}`,
    tc: "O(m logs)",
    sc: "O(depth)",
    followup:
      "<span class='q'>Multi-threaded logs?</span> The single-stack model breaks — you would track per-thread stacks and attribute time per thread.",
  },
  {
    n: "28",
    title: "Kth Largest Element in an Array",
    diff: "med",
    lc: "215",
    pat: "Heap / Quickselect",
    statement: "Return the k-th largest element in an unsorted array.",
    example: `nums = [3,2,1,5,6,4], k = 2  ->  5`,
    approach:
      "A size-k min-heap keeps the k largest; its root is the answer (O(n log k)). Quickselect partitions toward the k-th index for O(n) average.",
    code: `public int findKthLargest(int[] nums, int k) {
    PriorityQueue<Integer> heap = new PriorityQueue<>();  // min-heap
    for (int n : nums) {
        heap.offer(n);
        if (heap.size() > k) heap.poll();  // keep only the k largest
    }
    return heap.peek();                    // k-th largest at the root
}`,
    tc: "O(n log k)",
    sc: "O(k)",
    followup:
      "<span class='q'>Streaming values (LC 703)?</span> Keep the size-k min-heap alive across a stream; each add is O(log k) and the root is always the current k-th largest.",
  },
];

export const META_CATEGORIES: MetaCategory[] = [
  { id: "strings", name: "Strings & Parsing", meta: "Meta's most-loved bucket", problems: STRINGS },
  { id: "arrays", name: "Arrays, Intervals & Search", meta: "prefix sums, sweeps, binary search", problems: ARRAYS },
  { id: "trees", name: "Trees & BST", meta: "BFS columns, DFS state up/down", problems: TREES },
  { id: "graphs", name: "Graphs, Heap & Design", meta: "flood fill, union-find, heaps", problems: GRAPHS },
];

export const META_SYSTEM_DESIGN: DesignPrompt[] = [
  { title: "Design an Ad Click Aggregator", note: "Streaming ingestion, windowed counts, exactly-once vs. approximate — throughput math is expected." },
  { title: "Design an Online Game Leaderboard", note: "Top-K at scale, rank queries, hot-key sharding, real-time updates vs. periodic snapshots." },
  { title: "Design LeetCode / a Judging System", note: "Submission queue, sandboxed execution, result fan-out, and idempotent retries." },
  { title: "Design a Ticket Booking System", note: "Seat reservation, holds/expiry, and avoiding double-booking under contention." },
  { title: "Design a Top-K / Trending System", note: "Count-min sketch vs. exact counts, decay windows, and read-heavy fan-out." },
  { title: "Product Architecture: Top-K Songs Widget", note: "Client + API + data model for a user-facing feature; drill the read path and caching." },
  { title: "Product Architecture: Price-Drop Tracker", note: "Watches, change detection, and notification fan-out with dedup." },
];

export const META_BEHAVIORAL: string[] = [
  "Tell me about a conflict with a teammate or another team, and how you resolved it.",
  "Describe a project you drove through ambiguity — unclear requirements or shifting goals.",
  "Tell me about a time you failed or made a wrong call. What did you learn?",
  "Give an example of cross-functional work (PM, data, design) and how you aligned it.",
  "When did you disagree with a decision and commit anyway — or change someone's mind with data?",
];

export const META_TOTAL = META_CATEGORIES.reduce((s, c) => s + c.problems.length, 0);
