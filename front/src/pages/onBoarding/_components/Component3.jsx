import React, { useState, useEffect } from "react";

function Component3({ moveToNext }) {
  const [gender, setGender] = useState(""); // 성별 관리

  // 성별이 선택되면 다음 버튼을 활성화시키기 위해 moveToNext 호출
  useEffect(() => {
    if (gender) {
      moveToNext(); // 성별이 선택되면 다음 단계로 이동 가능
    }
  }, [gender, moveToNext]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-8">성별을 선택해주세요.</h2>
      <div className="justify-center flex space-x-4">
        <label>
          <input
            type="radio"
            name="gender"
            value="male"
            checked={gender === "male"}
            onChange={(e) => setGender(e.target.value)}
            className="mr-2"
          />
          남성
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="female"
            checked={gender === "female"}
            onChange={(e) => setGender(e.target.value)}
            className="mr-2"
          />
          여성
        </label>
      </div>
    </div>
  );
}

export default Component3;
