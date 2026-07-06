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

const STRINGS_MORE: Problem[] = [
  {
    n: "09", title: "Longest Substring Without Repeating Characters", diff: "med", lc: "3", pat: "Sliding Window",
    statement: "Return the length of the longest substring with no repeated character.",
    example: `s = "abcabcbb"  ->  3  ("abc")`,
    approach: "Sliding window with a <code>char to last-index</code> map. Grow the right edge; on a repeat inside the window, jump the left edge just past the previous occurrence.",
    code: `public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> last = new HashMap<>();
    int left = 0, best = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        if (last.containsKey(c) && last.get(c) >= left) left = last.get(c) + 1; // jump past dup
        last.put(c, right);
        best = Math.max(best, right - left + 1);
    }
    return best;
}`,
    tc: "O(n)", sc: "O(min(n, charset))",
    followup: "<span class='q'>At most K distinct characters (LC 340)?</span> Same window, shrink when the distinct count exceeds K.",
  },
  {
    n: "10", title: "Minimum Window Substring", diff: "hard", lc: "76", pat: "Sliding Window",
    statement: "Return the smallest substring of s containing every character of t (with multiplicity), or empty.",
    example: `s = "ADOBECODEBANC", t = "ABC"  ->  "BANC"`,
    approach: "Expand until the window covers t (a <code>required</code> counter hits 0), then contract from the left while still valid, recording the best. Surplus characters go negative in the need array.",
    code: `public String minWindow(String s, String t) {
    if (s.length() < t.length()) return "";
    int[] need = new int[128];
    for (char c : t.toCharArray()) need[c]++;
    int required = t.length(), left = 0, bestLen = Integer.MAX_VALUE, bestStart = 0;
    for (int right = 0; right < s.length(); right++) {
        if (need[s.charAt(right)]-- > 0) required--;       // consumed a needed char
        while (required == 0) {                             // valid window
            if (right - left + 1 < bestLen) { bestLen = right - left + 1; bestStart = left; }
            if (need[s.charAt(left)]++ == 0) required++;    // about to break validity
            left++;
        }
    }
    return bestLen == Integer.MAX_VALUE ? "" : s.substring(bestStart, bestStart + bestLen);
}`,
    tc: "O(s + t)", sc: "O(1)",
    followup: "<span class='q'>Unicode t?</span> Swap the fixed 128 array for a HashMap; the have/need bookkeeping is unchanged.",
  },
  {
    n: "11", title: "Valid Palindrome", diff: "easy", lc: "125", pat: "Two Pointers",
    statement: "Return whether the string reads the same forwards and backwards, ignoring case and non-alphanumerics.",
    example: `s = "A man, a plan, a canal: Panama"  ->  true`,
    approach: "Two pointers inward, skipping non-alphanumeric characters and comparing lowercased. No cleaned copy needed, so O(1) space.",
    code: `public boolean isPalindrome(String s) {
    int l = 0, r = s.length() - 1;
    while (l < r) {
        while (l < r && !Character.isLetterOrDigit(s.charAt(l))) l++;
        while (l < r && !Character.isLetterOrDigit(s.charAt(r))) r--;
        if (Character.toLowerCase(s.charAt(l)) != Character.toLowerCase(s.charAt(r))) return false;
        l++; r--;
    }
    return true;
}`,
    tc: "O(n)", sc: "O(1)",
    followup: "<span class='q'>Allow one deletion?</span> On mismatch, try skipping either side and test the remainder (LC 680, earlier in this set).",
  },
  {
    n: "12", title: "Group Anagrams", diff: "med", lc: "49", pat: "Hashing",
    statement: "Group strings that are anagrams of each other.",
    example: `["eat","tea","tan","ate","nat","bat"]  ->  [["eat","tea","ate"],["tan","nat"],["bat"]]`,
    approach: "Bucket by a canonical key. A 26-length character-count signature (with separators) is an O(k) key per word, beating the O(k log k) sorted-string key.",
    code: `public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> groups = new HashMap<>();
    for (String s : strs) {
        int[] count = new int[26];
        for (char c : s.toCharArray()) count[c - 'a']++;
        StringBuilder key = new StringBuilder();
        for (int n : count) key.append(n).append('#');   // separator avoids collisions
        groups.computeIfAbsent(key.toString(), k -> new ArrayList<>()).add(s);
    }
    return new ArrayList<>(groups.values());
}`,
    tc: "O(n * k)", sc: "O(n * k)",
    followup: "<span class='q'>Why the separator?</span> Without it, counts like [1,12] and [11,2] both stringify to 112 and collide.",
  },
  {
    n: "13", title: "One Edit Distance", diff: "med", lc: "161", pat: "Two Pointers",
    statement: "Return whether s and t are exactly one edit (insert, delete, or replace) apart.",
    example: `s = "cat", t = "cast"  ->  true`,
    approach: "Scan to the first differing character. Equal lengths means a replace; otherwise the longer string must match after skipping that one character. Equal strings are zero edits, not one.",
    code: `public boolean isOneEditDistance(String s, String t) {
    int m = s.length(), n = t.length();
    if (Math.abs(m - n) > 1) return false;
    for (int i = 0; i < Math.min(m, n); i++) {
        if (s.charAt(i) != t.charAt(i)) {
            if (m == n) return s.substring(i + 1).equals(t.substring(i + 1));  // replace
            if (m < n)  return s.substring(i).equals(t.substring(i + 1));      // insert into s
            return s.substring(i + 1).equals(t.substring(i));                   // delete from s
        }
    }
    return Math.abs(m - n) == 1;   // one is a prefix of the other, off by exactly one
}`,
    tc: "O(n)", sc: "O(n)",
    followup: "<span class='q'>General edit distance?</span> That is a 2D DP — but Meta usually keeps it to this one-edit variant since DP is avoided.",
  },
  {
    n: "14", title: "Multiply Strings", diff: "med", lc: "43", pat: "Math",
    statement: "Multiply two non-negative numbers given as strings, without BigInteger.",
    example: `num1 = "123", num2 = "456"  ->  "56088"`,
    approach: "Grade-school multiplication into an int array of size m+n. The product of digits at i and j lands at indices i+j and i+j+1; carry along the way, then trim a leading zero.",
    code: `public String multiply(String num1, String num2) {
    if (num1.equals("0") || num2.equals("0")) return "0";
    int m = num1.length(), n = num2.length();
    int[] prod = new int[m + n];
    for (int i = m - 1; i >= 0; i--)
        for (int j = n - 1; j >= 0; j--) {
            int mul = (num1.charAt(i) - '0') * (num2.charAt(j) - '0');
            int sum = mul + prod[i + j + 1];
            prod[i + j + 1] = sum % 10;
            prod[i + j] += sum / 10;         // carry into the higher position
        }
    StringBuilder sb = new StringBuilder();
    for (int d : prod) if (!(sb.length() == 0 && d == 0)) sb.append(d);
    return sb.toString();
}`,
    tc: "O(m * n)", sc: "O(m + n)",
    followup: "<span class='q'>Why i+j and i+j+1?</span> Positional arithmetic: a digit product spans two decimal places, the low one plus a carry.",
  },
  {
    n: "15", title: "Roman to Integer", diff: "easy", lc: "13", pat: "Scan",
    statement: "Convert a Roman numeral to its integer value.",
    example: `s = "MCMXCIV"  ->  1994`,
    approach: "Scan left to right. Add each symbol's value, but subtract it when a smaller symbol precedes a larger one (the subtractive forms like IV, IX, CM).",
    code: `public int romanToInt(String s) {
    Map<Character, Integer> val = Map.of(
        'I',1,'V',5,'X',10,'L',50,'C',100,'D',500,'M',1000);
    int total = 0;
    for (int i = 0; i < s.length(); i++) {
        int cur = val.get(s.charAt(i));
        if (i + 1 < s.length() && cur < val.get(s.charAt(i + 1))) total -= cur; // subtractive
        else total += cur;
    }
    return total;
}`,
    tc: "O(n)", sc: "O(1)",
    followup: "<span class='q'>Integer to Roman?</span> Greedily subtract from a value-symbol table ordered high to low, including the subtractive pairs.",
  },
  {
    n: "16", title: "Integer to English Words", diff: "hard", lc: "273", pat: "Recursion",
    statement: "Convert a non-negative integer to its English words representation.",
    example: `num = 1234567  ->  "One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven"`,
    approach: "Process the number in groups of three digits from the least-significant end, naming each group and appending its scale (Thousand, Million, Billion). A helper spells any value under 1000.",
    code: `private static final String[] BELOW20 = {"","One","Two","Three","Four","Five","Six","Seven",
    "Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
    "Seventeen","Eighteen","Nineteen"};
private static final String[] TENS = {"","","Twenty","Thirty","Forty","Fifty","Sixty",
    "Seventy","Eighty","Ninety"};
private static final String[] SCALE = {"","Thousand","Million","Billion"};

public String numberToWords(int num) {
    if (num == 0) return "Zero";
    StringBuilder sb = new StringBuilder();
    int i = 0;
    while (num > 0) {
        if (num % 1000 != 0)
            sb.insert(0, helper(num % 1000) + SCALE[i] + " ");
        num /= 1000;
        i++;
    }
    return sb.toString().trim();
}
private String helper(int n) {
    if (n == 0) return "";
    if (n < 20) return BELOW20[n] + " ";
    if (n < 100) return TENS[n / 10] + " " + helper(n % 10);
    return BELOW20[n / 100] + " Hundred " + helper(n % 100);
}`,
    tc: "O(1) (bounded 32-bit)", sc: "O(1)",
    followup: "<span class='q'>Where do candidates slip?</span> Trailing spaces and the zero-group case (e.g. 1,000,000) — group-then-trim handles both.",
  },
];

const ARRAYS_MORE: Problem[] = [
  {
    n: "18", title: "Product of Array Except Self", diff: "med", lc: "238", pat: "Prefix/Suffix",
    statement: "Return an array where output[i] is the product of all elements except nums[i]. No division, O(n).",
    example: `nums = [1,2,3,4]  ->  [24,12,8,6]`,
    approach: "One forward pass fills prefix products, one backward pass folds in a running suffix product. The output array is the only extra space.",
    code: `public int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] out = new int[n];
    out[0] = 1;
    for (int i = 1; i < n; i++) out[i] = out[i - 1] * nums[i - 1]; // prefix
    int suffix = 1;
    for (int i = n - 1; i >= 0; i--) { out[i] *= suffix; suffix *= nums[i]; } // suffix
    return out;
}`,
    tc: "O(n)", sc: "O(1)",
    followup: "<span class='q'>Handles zeros?</span> Yes, automatically — a single zero zeroes all but its index; two zeros zero everything.",
  },
  {
    n: "19", title: "Move Zeroes", diff: "easy", lc: "283", pat: "Two Pointers",
    statement: "Move all zeros to the end in place, preserving the order of non-zero elements.",
    example: `[0,1,0,3,12]  ->  [1,3,12,0,0]`,
    approach: "A write pointer packs non-zero values to the front; fill the remainder with zeros.",
    code: `public void moveZeroes(int[] nums) {
    int insert = 0;
    for (int n : nums) if (n != 0) nums[insert++] = n; // pack non-zeros
    while (insert < nums.length) nums[insert++] = 0;   // pad zeros
}`,
    tc: "O(n)", sc: "O(1)",
    followup: "<span class='q'>Minimize writes?</span> Swap the next non-zero into the write slot only when they differ, avoiding no-op writes.",
  },
  {
    n: "20", title: "3Sum", diff: "med", lc: "15", pat: "Two Pointers",
    statement: "Return all unique triplets that sum to zero.",
    example: `nums = [-1,0,1,2,-1,-4]  ->  [[-1,-1,2],[-1,0,1]]`,
    approach: "Sort, fix each anchor, and two-pointer the rest for the pair summing to its negation. Skip equal anchors and equal pair-ends to dedupe.",
    code: `public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> res = new ArrayList<>();
    for (int i = 0; i < nums.length - 2; i++) {
        if (nums[i] > 0) break;
        if (i > 0 && nums[i] == nums[i - 1]) continue;   // skip duplicate anchor
        int l = i + 1, r = nums.length - 1;
        while (l < r) {
            int sum = nums[i] + nums[l] + nums[r];
            if (sum < 0) l++;
            else if (sum > 0) r--;
            else {
                res.add(Arrays.asList(nums[i], nums[l], nums[r]));
                l++; r--;
                while (l < r && nums[l] == nums[l - 1]) l++;
                while (l < r && nums[r] == nums[r + 1]) r--;
            }
        }
    }
    return res;
}`,
    tc: "O(n^2)", sc: "O(1)",
    followup: "<span class='q'>3Sum Closest?</span> Track the sum nearest target instead of exact zero, same two-pointer sweep.",
  },
  {
    n: "21", title: "Next Permutation", diff: "med", lc: "31", pat: "Array",
    statement: "Rearrange the array into the next lexicographically greater permutation in place; wrap to sorted if none.",
    example: `[1,2,3]  ->  [1,3,2]`,
    approach: "Find the rightmost ascending pair (the pivot), swap the pivot with the next larger element to its right, then reverse the descending suffix.",
    code: `public void nextPermutation(int[] nums) {
    int n = nums.length, i = n - 2;
    while (i >= 0 && nums[i] >= nums[i + 1]) i--;        // find pivot
    if (i >= 0) {
        int j = n - 1;
        while (nums[j] <= nums[i]) j--;                  // next larger
        swap(nums, i, j);
    }
    reverse(nums, i + 1, n - 1);                         // reverse suffix
}
private void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
private void reverse(int[] a, int i, int j) { while (i < j) swap(a, i++, j--); }`,
    tc: "O(n)", sc: "O(1)",
    followup: "<span class='q'>kth permutation directly?</span> Use the factorial number system to pick each digit rather than stepping k times.",
  },
  {
    n: "22", title: "Insert Interval", diff: "med", lc: "57", pat: "Intervals",
    statement: "Insert a new interval into a sorted, non-overlapping set and merge as needed.",
    example: `[[1,3],[6,9]], new=[2,5]  ->  [[1,5],[6,9]]`,
    approach: "Three phases over the already-sorted list: copy intervals ending before the new one, merge everything overlapping it, then copy the rest.",
    code: `public int[][] insert(int[][] intervals, int[] newInterval) {
    List<int[]> res = new ArrayList<>();
    int i = 0, n = intervals.length;
    while (i < n && intervals[i][1] < newInterval[0]) res.add(intervals[i++]);   // before
    while (i < n && intervals[i][0] <= newInterval[1]) {                          // overlap
        newInterval[0] = Math.min(newInterval[0], intervals[i][0]);
        newInterval[1] = Math.max(newInterval[1], intervals[i][1]);
        i++;
    }
    res.add(newInterval);
    while (i < n) res.add(intervals[i++]);                                        // after
    return res.toArray(new int[0][]);
}`,
    tc: "O(n)", sc: "O(n)",
    followup: "<span class='q'>Stream of inserts?</span> Keep the set sorted and binary-search the insertion point each time.",
  },
  {
    n: "23", title: "Meeting Rooms II", diff: "med", lc: "253", pat: "Heap / Sweep",
    statement: "Return the minimum number of rooms needed for all meetings.",
    example: `[[0,30],[5,10],[15,20]]  ->  2`,
    approach: "Sort by start; a min-heap of end times holds meetings in progress. Free a room when its meeting has ended before the next starts. The peak heap size is the answer.",
    code: `public int minMeetingRooms(int[][] intervals) {
    Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
    PriorityQueue<Integer> ends = new PriorityQueue<>();   // min-heap of end times
    for (int[] m : intervals) {
        if (!ends.isEmpty() && ends.peek() <= m[0]) ends.poll(); // a room freed up
        ends.offer(m[1]);
    }
    return ends.size();
}`,
    tc: "O(n log n)", sc: "O(n)",
    followup: "<span class='q'>Sweep-line alternative?</span> Sort starts and ends separately, +1 at each start and -1 at each end, tracking the running max.",
  },
  {
    n: "24", title: "Top K Frequent Elements", diff: "med", lc: "347", pat: "Heap / Bucket",
    statement: "Return the k most frequent elements.",
    example: `nums = [1,1,1,2,2,3], k = 2  ->  [1,2]`,
    approach: "Count frequencies, then keep a size-k min-heap keyed on frequency, evicting the least frequent. Bucket sort by frequency gives true O(n).",
    code: `public int[] topKFrequent(int[] nums, int k) {
    Map<Integer, Integer> freq = new HashMap<>();
    for (int n : nums) freq.merge(n, 1, Integer::sum);
    PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> freq.get(a) - freq.get(b));
    for (int key : freq.keySet()) {
        heap.offer(key);
        if (heap.size() > k) heap.poll();   // drop least frequent
    }
    int[] res = new int[k];
    for (int i = k - 1; i >= 0; i--) res[i] = heap.poll();
    return res;
}`,
    tc: "O(n log k)", sc: "O(n)",
    followup: "<span class='q'>Top K Frequent Words (LC 692)?</span> Break frequency ties lexicographically in the comparator.",
  },
  {
    n: "25", title: "Pow(x, n)", diff: "med", lc: "50", pat: "Binary Exponentiation",
    statement: "Compute x raised to the power n (n can be negative) in O(log n).",
    example: `x = 2.0, n = 10  ->  1024.0`,
    approach: "Square the base and halve the exponent, folding the base into the result whenever the current exponent bit is set. Widen n to long to survive negating Integer.MIN_VALUE.",
    code: `public double myPow(double x, int n) {
    long exp = n;
    if (exp < 0) { x = 1 / x; exp = -exp; }   // widen avoids MIN_VALUE overflow
    double res = 1;
    while (exp > 0) {
        if ((exp & 1) == 1) res *= x;         // this exponent bit is set
        x *= x;                               // square the base
        exp >>= 1;
    }
    return res;
}`,
    tc: "O(log n)", sc: "O(1)",
    followup: "<span class='q'>Recursive version?</span> half = pow(x, n/2); return half*half (times x if n is odd) — same log-time idea.",
  },
];

const TREES_MORE: Problem[] = [
  {
    n: "25", title: "Validate Binary Search Tree", diff: "med", lc: "98", pat: "DFS (range)",
    statement: "Return whether the tree is a valid BST.",
    example: `[2,1,3]  ->  true`,
    approach: "Pass a valid (low, high) range down that tightens as you descend — left caps the max at the node value, right raises the min. Long bounds avoid the Integer edge values.",
    code: `public boolean isValidBST(TreeNode root) {
    return valid(root, Long.MIN_VALUE, Long.MAX_VALUE);
}
private boolean valid(TreeNode node, long low, long high) {
    if (node == null) return true;
    if (node.val <= low || node.val >= high) return false;
    return valid(node.left, low, node.val) && valid(node.right, node.val, high);
}`,
    tc: "O(n)", sc: "O(h)",
    followup: "<span class='q'>In-order alternative?</span> An in-order traversal of a BST is strictly increasing — verify that instead.",
  },
  {
    n: "26", title: "Binary Tree Maximum Path Sum", diff: "hard", lc: "124", pat: "DFS (return one, update global)",
    statement: "Find the maximum sum of any path (node to node) following edges.",
    example: `[-10,9,20,null,null,15,7]  ->  42`,
    approach: "Recursion returns a node's best one-sided gain (clamping negatives to 0), while a global tracks the best path turning at a node, which may use both sides.",
    code: `private int best;
public int maxPathSum(TreeNode root) {
    best = Integer.MIN_VALUE;
    gain(root);
    return best;
}
private int gain(TreeNode node) {
    if (node == null) return 0;
    int left = Math.max(gain(node.left), 0);
    int right = Math.max(gain(node.right), 0);
    best = Math.max(best, node.val + left + right);   // path turning here (both sides)
    return node.val + Math.max(left, right);          // contribute upward (one side)
}`,
    tc: "O(n)", sc: "O(h)",
    followup: "<span class='q'>Why clamp negatives to 0?</span> A subtree with negative gain should be dropped rather than extended into.",
  },
  {
    n: "27", title: "Convert BST to Sorted Doubly Linked List", diff: "med", lc: "426", pat: "In-order",
    statement: "Convert a BST into a sorted circular doubly linked list in place.",
    example: `[4,2,5,1,3]  ->  1<->2<->3<->4<->5 (circular)`,
    approach: "In-order traversal wires each visited node to the previous one. Track the first and last nodes, then close the ring at the end.",
    code: `private Node first, last;
public Node treeToDoublyList(Node root) {
    if (root == null) return null;
    inorder(root);
    last.right = first;   // close the circle
    first.left = last;
    return first;
}
private void inorder(Node node) {
    if (node == null) return;
    inorder(node.left);
    if (last != null) { last.right = node; node.left = last; }
    else first = node;      // leftmost is the head
    last = node;
    inorder(node.right);
}`,
    tc: "O(n)", sc: "O(h)",
    followup: "<span class='q'>Flatten to a singly linked list (LC 114) instead?</span> A reverse pre-order rewires right pointers with O(1) extra space (Morris-style).",
  },
  {
    n: "28", title: "Kth Smallest Element in a BST", diff: "med", lc: "230", pat: "In-order",
    statement: "Return the k-th smallest value in a BST.",
    example: `root=[3,1,4,null,2], k=1  ->  1`,
    approach: "Iterative in-order with an explicit stack visits values in sorted order; stop at the k-th, so you never traverse the whole tree.",
    code: `public int kthSmallest(TreeNode root, int k) {
    Deque<TreeNode> stack = new ArrayDeque<>();
    TreeNode cur = root;
    while (cur != null || !stack.isEmpty()) {
        while (cur != null) { stack.push(cur); cur = cur.left; }
        cur = stack.pop();
        if (--k == 0) return cur.val;    // k-th smallest reached
        cur = cur.right;
    }
    return -1;
}`,
    tc: "O(h + k)", sc: "O(h)",
    followup: "<span class='q'>Frequent modifications plus queries?</span> Augment nodes with subtree sizes for O(h) k-th lookups.",
  },
  {
    n: "29", title: "Lowest Common Ancestor III (with parent pointers)", diff: "med", lc: "1650", pat: "Two Pointers",
    statement: "Given two nodes that each carry a parent pointer, return their lowest common ancestor.",
    example: `p and q in a tree with parent links  ->  their LCA`,
    approach: "Walk up from both, switching to the other node's start when one reaches the root. They meet at the LCA after equalizing depths — the linked-list-intersection trick.",
    code: `public Node lowestCommonAncestor(Node p, Node q) {
    Node a = p, b = q;
    while (a != b) {
        a = (a == null) ? q : a.parent;   // switch lists to equalize depth
        b = (b == null) ? p : b.parent;
    }
    return a;
}`,
    tc: "O(h)", sc: "O(1)",
    followup: "<span class='q'>No parent pointers (LC 236)?</span> Recurse and return the node where both sides come back non-null (earlier in this set).",
  },
  {
    n: "30", title: "Serialize and Deserialize Binary Tree", diff: "hard", lc: "297", pat: "DFS Encoding",
    statement: "Encode a tree to a string and decode it back to the identical tree.",
    example: `[1,2,3,null,null,4,5]  ->  string  ->  same tree`,
    approach: "Pre-order with explicit null markers captures structure unambiguously; decoding consumes tokens in the same order, so it mirrors the encoding recursion.",
    code: `public String serialize(TreeNode root) {
    StringBuilder sb = new StringBuilder();
    build(root, sb);
    return sb.toString();
}
private void build(TreeNode node, StringBuilder sb) {
    if (node == null) { sb.append("#,"); return; }
    sb.append(node.val).append(',');
    build(node.left, sb); build(node.right, sb);
}
public TreeNode deserialize(String data) {
    Queue<String> t = new LinkedList<>(Arrays.asList(data.split(",")));
    return parse(t);
}
private TreeNode parse(Queue<String> t) {
    String v = t.poll();
    if (v.equals("#")) return null;
    TreeNode node = new TreeNode(Integer.parseInt(v));
    node.left = parse(t); node.right = parse(t);
    return node;
}`,
    tc: "O(n)", sc: "O(n)",
    followup: "<span class='q'>Serialize a BST more compactly?</span> Skip null markers — the BST ordering lets you rebuild from pre-order alone using value bounds.",
  },
];

const GRAPHS_MORE: Problem[] = [
  {
    n: "29", title: "Clone Graph", diff: "med", lc: "133", pat: "DFS + Hash",
    statement: "Deep-copy a connected undirected graph of nodes with neighbor lists.",
    example: `adjList = [[2,4],[1,3],[2,4],[1,3]]  ->  identical clone`,
    approach: "Traverse while keeping an original-to-clone map that doubles as the visited set. Register a clone before recursing into neighbors so cycles do not loop forever.",
    code: `public Node cloneGraph(Node node) {
    if (node == null) return null;
    return dfs(node, new HashMap<>());
}
private Node dfs(Node node, Map<Node, Node> clones) {
    if (clones.containsKey(node)) return clones.get(node);
    Node copy = new Node(node.val);
    clones.put(node, copy);                    // register BEFORE recursing (handles cycles)
    for (Node nb : node.neighbors) copy.neighbors.add(dfs(nb, clones));
    return copy;
}`,
    tc: "O(V + E)", sc: "O(V)",
    followup: "<span class='q'>BFS version?</span> Same map, but enqueue neighbors and wire clones as you dequeue — avoids deep recursion on large graphs.",
  },
  {
    n: "30", title: "Course Schedule", diff: "med", lc: "207", pat: "Topological Sort",
    statement: "Given prerequisites, can all courses be finished (is the dependency graph acyclic)?",
    example: `numCourses = 2, prereqs = [[1,0]]  ->  true`,
    approach: "Kahn's topological sort: start from zero-in-degree nodes and peel them off. If every node is processed there is no cycle.",
    code: `public boolean canFinish(int numCourses, int[][] prerequisites) {
    List<List<Integer>> adj = new ArrayList<>();
    int[] indeg = new int[numCourses];
    for (int i = 0; i < numCourses; i++) adj.add(new ArrayList<>());
    for (int[] p : prerequisites) { adj.get(p[1]).add(p[0]); indeg[p[0]]++; }
    Queue<Integer> q = new LinkedList<>();
    for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.offer(i);
    int done = 0;
    while (!q.isEmpty()) {
        int cur = q.poll();
        done++;
        for (int next : adj.get(cur)) if (--indeg[next] == 0) q.offer(next);
    }
    return done == numCourses;   // all processed ⇒ acyclic
}`,
    tc: "O(V + E)", sc: "O(V + E)",
    followup: "<span class='q'>Return the order (LC 210)?</span> Record nodes as they are dequeued; the dequeue order is a valid topological order.",
  },
  {
    n: "31", title: "Alien Dictionary", diff: "hard", lc: "269", pat: "Topological Sort",
    statement: "Given words sorted in an unknown alphabet's order, return a valid character order, or empty if impossible.",
    example: `["wrt","wrf","er","ett","rftt"]  ->  "wertf"`,
    approach: "Each adjacent word pair yields one ordering clue at their first differing character. Build a graph from those clues and topologically sort it; a cycle means contradiction.",
    code: `public String alienOrder(String[] words) {
    Map<Character, Set<Character>> adj = new HashMap<>();
    Map<Character, Integer> indeg = new HashMap<>();
    for (String w : words) for (char c : w.toCharArray()) {
        adj.putIfAbsent(c, new HashSet<>());
        indeg.putIfAbsent(c, 0);
    }
    for (int i = 0; i < words.length - 1; i++) {
        String a = words[i], b = words[i + 1];
        if (a.length() > b.length() && a.startsWith(b)) return "";  // invalid prefix order
        for (int j = 0; j < Math.min(a.length(), b.length()); j++) {
            char x = a.charAt(j), y = b.charAt(j);
            if (x != y) { if (adj.get(x).add(y)) indeg.merge(y, 1, Integer::sum); break; }
        }
    }
    Queue<Character> q = new LinkedList<>();
    for (char c : indeg.keySet()) if (indeg.get(c) == 0) q.offer(c);
    StringBuilder sb = new StringBuilder();
    while (!q.isEmpty()) {
        char c = q.poll();
        sb.append(c);
        for (char next : adj.get(c)) if (indeg.merge(next, -1, Integer::sum) == 0) q.offer(next);
    }
    return sb.length() == indeg.size() ? sb.toString() : "";   // leftover ⇒ cycle
}`,
    tc: "O(total chars)", sc: "O(unique + clues)",
    followup: "<span class='q'>Two subtle rules?</span> Only the first differing char is a clue, and a longer word before its own prefix is invalid.",
  },
  {
    n: "32", title: "Merge k Sorted Lists", diff: "hard", lc: "23", pat: "Heap",
    statement: "Merge k sorted linked lists into one sorted list.",
    example: `[[1,4,5],[1,3,4],[2,6]]  ->  1->1->2->3->4->4->5->6`,
    approach: "A min-heap of the k current heads always yields the global minimum. Poll it, append, and push its next.",
    code: `public ListNode mergeKLists(ListNode[] lists) {
    PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);
    for (ListNode node : lists) if (node != null) pq.offer(node);
    ListNode dummy = new ListNode(0), tail = dummy;
    while (!pq.isEmpty()) {
        ListNode cur = pq.poll();
        tail.next = cur; tail = cur;
        if (cur.next != null) pq.offer(cur.next);
    }
    return dummy.next;
}`,
    tc: "O(N log k)", sc: "O(k)",
    followup: "<span class='q'>No heap?</span> Pairwise-merge lists two at a time (divide and conquer) — also O(N log k).",
  },
  {
    n: "33", title: "LRU Cache", diff: "med", lc: "146", pat: "Design",
    statement: "Implement get and put in O(1), evicting the least-recently-used key at capacity.",
    example: `capacity 2; put(1,1),put(2,2),get(1),put(3,3)  ->  evicts key 2`,
    approach: "A HashMap for O(1) lookup plus a doubly linked list ordered by recency. Every access moves a node to the head; eviction removes the tail. Dummy head/tail sentinels remove edge cases.",
    code: `class LRUCache {
    private class Node { int key, val; Node prev, next; Node(int k, int v){ key=k; val=v; } }
    private final Map<Integer, Node> map = new HashMap<>();
    private final Node head = new Node(0,0), tail = new Node(0,0);
    private final int capacity;

    public LRUCache(int capacity) { this.capacity = capacity; head.next = tail; tail.prev = head; }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node n = map.get(key);
        remove(n); insertFront(n);          // most-recently-used
        return n.val;
    }
    public void put(int key, int value) {
        if (map.containsKey(key)) remove(map.get(key));
        Node n = new Node(key, value);
        map.put(key, n); insertFront(n);
        if (map.size() > capacity) { Node lru = tail.prev; remove(lru); } // evict LRU
    }
    private void remove(Node n){ n.prev.next = n.next; n.next.prev = n.prev; map.remove(n.key); }
    private void insertFront(Node n){
        n.next = head.next; n.prev = head;
        head.next.prev = n; head.next = n; map.put(n.key, n);
    }
}`,
    tc: "O(1) get/put", sc: "O(capacity)",
    followup: "<span class='q'>Built-in shortcut?</span> A LinkedHashMap with accessOrder=true and removeEldestEntry does it in a few lines — mention it, then show the manual version.",
  },
  {
    n: "34", title: "Insert Delete GetRandom O(1)", diff: "med", lc: "380", pat: "Design",
    statement: "Support insert, remove, and getRandom, each in average O(1).",
    example: `insert(1), remove(2), insert(2), getRandom()  ->  uniform pick`,
    approach: "A dynamic array gives O(1) random access; a value-to-index map gives O(1) locate. To remove, swap the target with the last element, fix its index, and pop the tail.",
    code: `class RandomizedSet {
    private final List<Integer> list = new ArrayList<>();
    private final Map<Integer, Integer> index = new HashMap<>();
    private final Random rand = new Random();

    public boolean insert(int val) {
        if (index.containsKey(val)) return false;
        index.put(val, list.size());
        list.add(val);
        return true;
    }
    public boolean remove(int val) {
        if (!index.containsKey(val)) return false;
        int i = index.get(val), last = list.size() - 1;
        list.set(i, list.get(last));       // move last into the hole
        index.put(list.get(i), i);
        list.remove(last);
        index.remove(val);
        return true;
    }
    public int getRandom() { return list.get(rand.nextInt(list.size())); }
}`,
    tc: "O(1) average", sc: "O(n)",
    followup: "<span class='q'>Allow duplicates (LC 381)?</span> Map each value to a set of indices; the swap-with-last removal stays the same.",
  },
  {
    n: "35", title: "Copy List with Random Pointer", diff: "med", lc: "138", pat: "Interleaving",
    statement: "Deep-copy a linked list where each node has a next and an arbitrary random pointer.",
    example: `each clone's random mirrors the original's`,
    approach: "Interleave each clone right after its original so a clone's random is original.random.next; then split the two lists apart. O(1) extra space.",
    code: `public Node copyRandomList(Node head) {
    if (head == null) return null;
    for (Node cur = head; cur != null; cur = cur.next.next) {   // weave clones in
        Node copy = new Node(cur.val);
        copy.next = cur.next; cur.next = copy;
    }
    for (Node cur = head; cur != null; cur = cur.next.next)      // wire randoms
        if (cur.random != null) cur.next.random = cur.random.next;
    Node dummy = new Node(0), copyTail = dummy;                  // un-weave
    for (Node cur = head; cur != null; cur = cur.next) {
        copyTail.next = cur.next; copyTail = copyTail.next;
        cur.next = cur.next.next;
    }
    return dummy.next;
}`,
    tc: "O(n)", sc: "O(1)",
    followup: "<span class='q'>Simpler version?</span> A HashMap from original to clone is O(n) space but easier to explain — lead with it, then optimize.",
  },
  {
    n: "36", title: "Add Two Numbers", diff: "med", lc: "2", pat: "Linked List",
    statement: "Two numbers as reversed digit lists; return their sum as a list.",
    example: `2->4->3  +  5->6->4  =  7->0->8`,
    approach: "Walk both lists least-significant-first, summing digits plus a carry, emitting one node per step. Loop while either list has digits or a carry remains.",
    code: `public ListNode addTwoNumbers(ListNode a, ListNode b) {
    ListNode dummy = new ListNode(0), tail = dummy;
    int carry = 0;
    while (a != null || b != null || carry != 0) {
        int sum = carry;
        if (a != null) { sum += a.val; a = a.next; }
        if (b != null) { sum += b.val; b = b.next; }
        carry = sum / 10;
        tail.next = new ListNode(sum % 10);
        tail = tail.next;
    }
    return dummy.next;
}`,
    tc: "O(max(m, n))", sc: "O(max(m, n))",
    followup: "<span class='q'>Digits stored forward (LC 445)?</span> Push both onto stacks (or reverse first) so you can add from the least-significant end.",
  },
];

export const META_CATEGORIES: MetaCategory[] = [
  { id: "strings", name: "Strings & Parsing", meta: "Meta's most-loved bucket", problems: [...STRINGS, ...STRINGS_MORE] },
  { id: "arrays", name: "Arrays, Intervals & Search", meta: "prefix sums, sweeps, binary search", problems: [...ARRAYS, ...ARRAYS_MORE] },
  { id: "trees", name: "Trees & BST", meta: "BFS columns, DFS state up/down", problems: [...TREES, ...TREES_MORE] },
  { id: "graphs", name: "Graphs, Heap & Design", meta: "flood fill, topo sort, heaps, design", problems: [...GRAPHS, ...GRAPHS_MORE] },
];

export interface Resource {
  group: string;
  title: string;
  url: string;
  note: string;
}

export const META_RESOURCES: Resource[] = [
  // Meta-specific guides
  { group: "Meta-specific guides", title: "Hello Interview — Meta E5 guide", url: "https://www.hellointerview.com/guides/meta/e5", note: "Loop breakdown, question categories, and answer keys — the most-cited E5 resource." },
  { group: "Meta-specific guides", title: "IGotAnOffer — Meta E5 interview", url: "https://igotanoffer.com/en/advice/meta-e5-interview", note: "Process, question buckets, and a structured prep plan for the senior loop." },
  { group: "Meta-specific guides", title: "interviewing.io — Senior Meta guide", url: "https://interviewing.io/guides/hiring-process/meta-facebook", note: "What repeats at Meta, plus the note that DP is effectively off the table." },
  { group: "Meta-specific guides", title: "DesignGurus — Meta system design 2026", url: "https://designgurus.substack.com/p/meta-system-design-interview-prep", note: "The 2026 process, the AI coding round, and a system-design question bank." },
  // Coding practice
  { group: "Coding practice", title: "NeetCode — practice roadmap", url: "https://neetcode.io/practice", note: "Pattern-organized problem sets with clean video explanations." },
  { group: "Coding practice", title: "Tech Interview Handbook — Grind 75", url: "https://www.techinterviewhandbook.org/grind75", note: "A time-boxed, high-signal problem list you can filter to your available hours." },
  { group: "Coding practice", title: "LeetCode — Meta company tag", url: "https://leetcode.com/company/facebook/", note: "The Meta-tagged set sorted by recency/frequency (needs a LeetCode account/Premium)." },
  // System design
  { group: "System design", title: "Hello Interview — System Design in a Hurry", url: "https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction", note: "A focused crash course; pairs well with Meta's product-architecture round." },
  { group: "System design", title: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer", note: "The canonical open-source reference — memorize the latency/throughput numbers." },
  // Behavioral
  { group: "Behavioral", title: "Tech Interview Handbook — Behavioral", url: "https://www.techinterviewhandbook.org/behavioral-interview/", note: "How to structure STAR stories for conflict, ambiguity, and ownership." },
  // Real E5 write-ups
  { group: "Real E5 write-ups", title: "Medium — My Interview Experience at Meta [E5 Offer]", url: "https://medium.com/@rohitverma_87831/my-interview-experience-at-meta-ad7eb22dd220", note: "A first-hand account of the full E5 loop and how each round felt." },
  { group: "Real E5 write-ups", title: "Medium — My Meta Interview Experience [E5 Offer]", url: "https://medium.com/@amukul82/my-meta-interview-experience-e5-offer-44f9816cf9e6", note: "Another recent E5 debrief with concrete prep advice." },
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
