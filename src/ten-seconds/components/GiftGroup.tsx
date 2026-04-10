import { cn } from "@/utils/cn";

interface GiftGroupProps {
  /** Ảnh quà tặng */
  imageSrc: string;
  imageClassName?: string;
  /** Nhãn chính hiển thị trong dải có gradient/border */
  label: string;
  labelClassName?: string;
  /** Mô tả nhỏ bên dưới */
  description: string;
  descriptionClassName?: string;
  /** Jackpot: màu vàng / gradient như modal kết quả jackpot */
  variant?: "default" | "jackpot";
  /** Override className của wrapper ngoài cùng */
  className?: string;
}

export const GiftGroup = ({
  imageSrc,
  imageClassName,
  label,
  labelClassName,
  description,
  descriptionClassName,
  variant = "default",
  className,
}: GiftGroupProps) => {
  return (
    <div
      className={cn("flex flex-col items-center gap-4.5 w-[390px]", className)}
    >
      <img
        src={imageSrc}
        alt=""
        className={cn("object-contain", imageClassName)}
      />
      <div
        className="border-y-[1.05px] h-[min(63px,5.83vh)] w-full border-x-0 border-solid backdrop-blur-[2.80246901512146px] flex items-center justify-center"
        style={{
          background:
            "linear-gradient(270deg, rgba(5, 93, 154, 0) 0%, rgba(5, 93, 154, 0.7) 49.81%, rgba(5, 93, 154, 0) 100%)",
          borderImage:
            "linear-gradient(270deg, rgba(53, 163, 239, 0) 0%, #35A3EF 50.41%, rgba(53, 163, 239, 0) 100%) 1",
        }}
      >
        <span
          className={cn(
            "text-white text-[min(1.875rem,1.5625vw)] font-medium font-main leading-none",
            labelClassName,
          )}
        >
          {label}
        </span>
      </div>
      <span
        className={cn(
          "font-main text-center leading-none",
          variant === "jackpot"
            ? "bg-gradient-to-b from-[#fffef5] via-[#fef08a] to-[#ca8a04] bg-clip-text text-transparent text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold drop-shadow-[0_2px_14px_rgba(250,204,21,0.55)] [-webkit-text-stroke:0.5px_rgba(180,83,9,0.2)]"
            : "text-white text-[min(1.625rem,1.354vw)]",
          descriptionClassName,
        )}
      >
        {description}
      </span>
    </div>
  );
};
