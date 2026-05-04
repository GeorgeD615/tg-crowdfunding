const CONTRACT_ADDRESS =
  "kQAC33wHICte9NmLNpNhDIGyvdB138EEZ1u852TtmZk2_iuW";

function parseStack(result: any): bigint {
  if (!result?.stack?.length) return 0n;

  const cell = result.stack[0];

  if (cell[0] === "num") {
    return BigInt(cell[1]);
  }

  return 0n;
}

async function callGet(method: string) {
  const res = await fetch(
    "https://testnet.toncenter.com/api/v2/runGetMethod",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": "effafb57c12498349ee5ff5dfa261991229ac48041b8b2eca6d8720a300bc726"
      },
      body: JSON.stringify({
        address: CONTRACT_ADDRESS,
        method,
        stack: []
      })
    }
  );

  const json = await res.json();

  console.log("FULL RESPONSE:", json);

  return json.result;
}

export async function getTotal() {
  const result = await callGet("getTotal");
  return parseStack(result);
}

export async function getGoal() {
  const result = await callGet("getGoal");
  return parseStack(result);
}

export async function getDeadline() {
  const result = await callGet("getDeadline");
  return parseStack(result);
}