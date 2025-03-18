import RowSteps from "@/components/common/rowSteps/RowSteps";

export default function Profile() {
  return <div className="container max-w-6xl w-11/12 mx-auto py-7 pb-24">
    <RowSteps 
      defaultStep={0}
      steps={[
        {
          title: "Datos personales",
        },
        {
          title: "Centro de estética",
        },
      ]}
    />
  </div>;
}